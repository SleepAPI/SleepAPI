import { BadRequestError } from '@src/domain/error/api/api-error.js';
import { ProgrammingError } from '@src/domain/error/programming/programming-error.js';
import type { UserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { SetCover } from '@src/services/solve/set-cover.js';
import type {
  IngredientProducerWithSettings,
  SetCoverPokemonSetup,
  SetCoverPokemonSetupWithSettings
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import {
  calculateProductionAll,
  convertAAAToAllIngredientSets,
  groupProducersByIngredient,
  hashPokemonSetIndexed,
  pokedexToMembers
} from '@src/services/solve/utils/solve-utils.js';
import { createTierlistIndex } from '@src/services/tier-list/tierlist-utils.js';
import { joinPath } from '@src/utils/file-utils/file-utils.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import type {
  Pokemon,
  PokemonWithFinalContribution,
  PokemonWithTiering,
  Recipe,
  SolveSettings,
  TeamMember,
  Tier,
  TierlistSettings,
  Time
} from 'sleepapi-common';
import {
  AVERAGE_WEEKLY_CRIT_MULTIPLIER,
  DEFAULT_ISLAND,
  emptyIngredientInventoryFloat,
  getAllIngredientLists,
  getPokemon,
  ingredient,
  INGREDIENT_SUPPORT_MAINSKILLS,
  ingredientSetToIntFlat,
  MathUtils,
  MAX_POT_SIZE,
  MAX_RECIPE_LEVEL,
  MAX_TEAM_SIZE,
  OPTIMAL_POKEDEX,
  recipeCoverage,
  recipeLevelBonus,
  RECIPES,
  simplifyIngredientSet,
  TastyChanceS
} from 'sleepapi-common';

export interface RecipeContribution {
  team: SetCoverPokemonSetupWithSettings[];
  recipe: Recipe;
  contributedPower: number;
  skillValue: number;
  coverage: number;
}
export interface PokemonWithRecipeContributionsRaw {
  pokemonWithSettings: SetCoverPokemonSetupWithSettings;
  contributions: RecipeContribution[];
}

// TODO: can we make nrOfMeals to take into consideration a query param? More meals more flexible
const NUMBER_OF_MEALS = 3;

class CookingTierlistImpl {
  bedtime: Time = { hour: 21, minute: 30, second: 0 };
  wakeup: Time = { hour: 6, minute: 0, second: 0 };

  public async get(settings: TierlistSettings): Promise<PokemonWithTiering[]> {
    return this.fromFile(settings, 'current');
  }

  public async seed(settings: TierlistSettings, userRecipes: UserRecipes) {
    const data: PokemonWithRecipeContributionsRaw[] = this.generate(settings, userRecipes);

    const combinedContributions: PokemonWithFinalContribution[] = [];
    for (let i = 0; i < data.length; ++i) {
      combinedContributions.push(this.calculateFinalContribution(data[i]));
    }
    combinedContributions.sort((a, b) => b.score - a.score);

    const previousData = await this.fromFile(settings, 'previous');
    const tieredData = this.tierAndDiff(combinedContributions, previousData);
    return await this.toFile(settings, tieredData);
  }

  private async fromFile(settings: TierlistSettings, version: 'current' | 'previous'): Promise<PokemonWithTiering[]> {
    const { level, camp } = settings;
    if (level !== 30 && level !== 60) {
      throw new BadRequestError('No tier list exists for level ' + level);
    }

    const dirName = joinPath(`../../data/tierlist/${version}/level${level}`, import.meta.url);
    const filePath = join(dirName, `${camp ? 'camp' : 'regular'}.json`);

    try {
      const fileContents = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileContents);
    } catch (error) {
      logger.error(`Error when reading previous tier list: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Will recursively create missing directories
   * Updates the cached current tier list
   */
  private async toFile(settings: TierlistSettings, data: PokemonWithFinalContribution[]): Promise<void> {
    const { level, camp } = settings;

    if (level !== 30 && level !== 60) {
      throw new BadRequestError('Cannot write tier list for level ' + level);
    }

    const dirName = joinPath(`../../data/tierlist/current/level${level}`, import.meta.url);
    const filePath = join(dirName, `${camp ? 'camp' : 'regular'}.json`);
    await fs.mkdir(dirName, { recursive: true });

    const fileContents = JSON.stringify(data);
    return await fs.writeFile(filePath, fileContents, 'utf-8');
  }

  private generate(settings: TierlistSettings, userRecipes: UserRecipes) {
    const { level, camp } = settings;
    const solveSettings: SolveSettings = {
      bedtime: this.bedtime,
      camp,
      level,
      wakeup: this.wakeup,
      includeCooking: true,
      stockpiledIngredients: emptyIngredientInventoryFloat(),
      potSize: MAX_POT_SIZE,
      island: { ...DEFAULT_ISLAND } // TODO: maybe we want to do x2 or x2.4 for comparing berry strength later
    };
    let counter = 0;
    console.time('Tierlist default production');

    const { productionMap: defaultProductionMap, setCoverSetups } = this.calculateProductionAll({
      solveSettings,
      userRecipes
    });
    const defaultCache = new Map();
    const producersByIngredientIndex = groupProducersByIngredient(setCoverSetups);
    const defaultSetCover = new SetCover(setCoverSetups, producersByIngredientIndex, defaultCache);

    console.timeEnd('Tierlist default production');
    const result: PokemonWithRecipeContributionsRaw[] = [];

    // TODO: split into functions
    for (const pkmn of OPTIMAL_POKEDEX) {
      const isSupport = INGREDIENT_SUPPORT_MAINSKILLS.some((skill) => skill.is(pkmn.skill));

      const { supportProductionMap, pokemonIngredientLists, supportSetCoverSetups } =
        this.getIngredientListsAndSupportMap({
          isSupport,
          pkmn,
          solveSettings,
          defaultProductionMap,
          userRecipes
        });

      for (const pokemonWithIngredients of pokemonIngredientLists) {
        const currentMemoryUsage = process.memoryUsage().heapUsed;
        const currentMemoryUsageGigabytes = currentMemoryUsage / 1024 ** 3;
        ++counter;
        logger.info('Current memory usage: ' + MathUtils.round(currentMemoryUsageGigabytes, 3) + ' GB');
        console.time(
          `[${counter}/${OPTIMAL_POKEDEX.length * pokemonIngredientLists.length}] ${pokemonWithIngredients.pokemonSet.pokemon}`
        );

        // TODO: we only have to filter pot size every 6th
        const recipesToCook = this.getRecipesWithinPotLimit(pokemonWithIngredients.averageWeekdayPotSize);
        const contributions: RecipeContribution[] = [];

        // TODO: can we worker thread this?
        for (const recipe of recipesToCook) {
          const producersByIngredientIndex = groupProducersByIngredient(supportSetCoverSetups);

          const recipeContribution = this.calculateRecipeContribution({
            recipe,
            currentPokemon: pokemonWithIngredients,
            setCover: isSupport
              ? new SetCover(supportSetCoverSetups, producersByIngredientIndex, new Map())
              : defaultSetCover,
            isSupport,
            defaultProduceMap: defaultProductionMap,
            supportProduceMap: supportProductionMap
          });

          recipeContribution && contributions.push(recipeContribution);
        }

        console.timeEnd(
          // FIXME: this doesn't work because some mons only have 4 ing lists
          `[${counter}/${OPTIMAL_POKEDEX.length * pokemonIngredientLists.length}] ${pokemonWithIngredients.pokemonSet.pokemon}`
        );

        result.push({
          pokemonWithSettings: pokemonWithIngredients,
          contributions
        });
      }
    }

    return result;
  }

  private calculateProductionAll(params: {
    solveSettings: SolveSettings;
    supportMember?: TeamMember;
    userRecipes: UserRecipes;
  }): {
    productionMap: Map<string, SetCoverPokemonSetupWithSettings>;
    setCoverSetups: SetCoverPokemonSetupWithSettings[];
    userProduction: SetCoverPokemonSetupWithSettings;
  } {
    const { solveSettings, supportMember, userRecipes } = params;

    const productionMap: Map<string, SetCoverPokemonSetupWithSettings> = new Map();
    const setCoverSetups: SetCoverPokemonSetupWithSettings[] = [];

    const { userProduction, nonSupportProduction, supportProduction } = calculateProductionAll({
      settings: solveSettings,
      userMembers: supportMember ? [supportMember] : [],
      userRecipes
    });

    for (const production of [...nonSupportProduction, ...supportProduction]) {
      setCoverSetups.push(production);
      productionMap.set(hashPokemonSetIndexed(production.pokemonSet), production);
    }

    return { productionMap, setCoverSetups, userProduction: userProduction[0] };
  }

  private getIngredientListsAndSupportMap(params: {
    pkmn: Pokemon;
    isSupport: boolean;
    solveSettings: SolveSettings;
    userRecipes: UserRecipes;
    defaultProductionMap: Map<string, SetCoverPokemonSetupWithSettings>;
  }): {
    supportProductionMap?: Map<string, SetCoverPokemonSetupWithSettings>;
    pokemonIngredientLists: SetCoverPokemonSetupWithSettings[];
    supportSetCoverSetups: SetCoverPokemonSetupWithSettings[];
  } {
    const { pkmn, isSupport, solveSettings, defaultProductionMap, userRecipes } = params;

    const pokemonIngredientLists: SetCoverPokemonSetupWithSettings[] = [];

    // if this is a support mon
    // re-calculate production for all other pokemon with this support mon included in team
    if (isSupport) {
      const supportMember: TeamMember = pokedexToMembers({
        pokedex: [pkmn],
        level: solveSettings.level,
        camp: solveSettings.camp
      })[0];

      const {
        productionMap,
        userProduction: userAAA,
        setCoverSetups
      } = this.calculateProductionAll({
        solveSettings: {
          ...solveSettings,
          includeCooking: false,
          stockpiledIngredients: emptyIngredientInventoryFloat()
        },
        supportMember,
        userRecipes
      });

      pokemonIngredientLists.push(
        ...convertAAAToAllIngredientSets([
          {
            averageHelps: userAAA.averageHelps,
            critMultiplier: userAAA.critMultiplier,
            averageWeekdayPotSize: userAAA.averageWeekdayPotSize,
            pokemon: supportMember.pokemonWithIngredients.pokemon,
            settings: supportMember.settings,
            skillIngredients: userAAA.skillIngredients
          }
        ])
      );
      return { supportProductionMap: productionMap, pokemonIngredientLists, supportSetCoverSetups: setCoverSetups };
    } else {
      for (const ingredientList of getAllIngredientLists(pkmn, solveSettings.level)) {
        const key = hashPokemonSetIndexed({
          pokemon: pkmn.name,
          ingredients: ingredientSetToIntFlat(ingredientList)
        });

        const nonSupportIngList = defaultProductionMap.get(key);
        if (!nonSupportIngList) {
          throw new ProgrammingError(
            `At least one ingredient list for non-support Pokémon, [${pkmn.name}], did not exist in default production map`
          );
        }
        pokemonIngredientLists.push(nonSupportIngList);
      }
      return { supportProductionMap: undefined, pokemonIngredientLists, supportSetCoverSetups: [] };
    }
  }

  private getRecipesWithinPotLimit(averageWeekdayPotSize: number) {
    return RECIPES.filter((recipe) => recipe.nrOfIngredients <= averageWeekdayPotSize);
  }

  private calculateRecipeContribution(params: {
    recipe: Recipe;
    currentPokemon: SetCoverPokemonSetupWithSettings;
    isSupport: boolean;
    setCover: SetCover;
    defaultProduceMap: Map<string, SetCoverPokemonSetupWithSettings>;
    supportProduceMap: Map<string, SetCoverPokemonSetupWithSettings> | undefined;
  }): RecipeContribution | undefined {
    const { recipe, currentPokemon, isSupport, setCover, defaultProduceMap, supportProduceMap } = params;
    const recipeIngredients = ingredientSetToIntFlat(recipe.ingredients);

    const { coverage, remainingRecipe, sumRemainingIngredients } = recipeCoverage(
      recipeIngredients,
      currentPokemon.totalIngredients
    );

    const teamSize = MAX_TEAM_SIZE - 1;
    let team: IngredientProducerWithSettings[] = [];
    let supportedIngredientsRelevant: Int16Array | undefined = undefined;
    let supportedIngredientsFiller: Int16Array | undefined = undefined;
    if (sumRemainingIngredients === 0) {
      team = [currentPokemon];
    } else {
      const solutions = setCover.solveRecipe(remainingRecipe, teamSize).teams;
      const solution = solutions.at(0)?.members;
      if (!solution) {
        return undefined;
      }

      team = [...solution, currentPokemon];
      if (isSupport && solution) {
        if (!supportProduceMap) {
          throw new ProgrammingError('Support produce map is not defined');
        }
        const { supportedRelevant, supportedFillers } = this.extractSupportedIngredients(
          solution,
          recipeIngredients,
          defaultProduceMap,
          supportProduceMap
        );

        supportedIngredientsRelevant = supportedRelevant;
        supportedIngredientsFiller = supportedFillers;
      }
    }

    const { fillers: ownFillers, relevant: ownRelevant } = this.extractOwnIngredients(
      currentPokemon,
      recipeIngredients
    );

    const { contributedPower, skillValue } = this.calculateContributionForTeam({
      recipe,
      currentPokemon,
      team,
      ownIngredientsFiller: ownFillers,
      ownIngredientsRelevant: ownRelevant,
      supportedIngredientsFiller,
      supportedIngredientsRelevant
    });

    return {
      team,
      recipe,
      contributedPower,
      skillValue,
      coverage
    };
  }

  private extractOwnIngredients(currentPokemon: SetCoverPokemonSetupWithSettings, recipe: Int16Array) {
    const relevant = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS);
    const fillers = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS);

    for (let i = 0; i < ingredient.TOTAL_NUMBER_OF_INGREDIENTS; ++i) {
      if (recipe[i] > 0) {
        const relevantFiller = Math.max(currentPokemon.totalIngredientsFloat[i] - recipe[i], 0);
        relevant[i] = currentPokemon.totalIngredientsFloat[i] - relevantFiller;
        fillers[i] = relevantFiller;
      } else {
        fillers[i] = currentPokemon.totalIngredientsFloat[i];
      }
    }

    return { relevant, fillers };
  }

  private extractSupportedIngredients(
    team: SetCoverPokemonSetup[],
    recipe: Int16Array,
    defaultProduceMap: Map<string, SetCoverPokemonSetupWithSettings>,
    supportProduceMap: Map<string, SetCoverPokemonSetupWithSettings>
  ) {
    const supportedRelevant = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS);
    const supportedFillers = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS);
    for (const member of team) {
      const hash = hashPokemonSetIndexed(member.pokemonSet);

      const defaultProduce = defaultProduceMap.get(hash);
      const supportedProduce = supportProduceMap.get(hash);

      if (!defaultProduce || !supportedProduce) {
        throw new ProgrammingError('Team member not available in either defaultProduceMap or supportProduceMap');
      }

      for (let i = 0; i < ingredient.TOTAL_NUMBER_OF_INGREDIENTS; ++i) {
        if (recipe[i] > 0) {
          supportedRelevant[i] = supportedProduce.totalIngredientsFloat[i] - defaultProduce.totalIngredientsFloat[i];
        } else {
          supportedFillers[i] = supportedProduce.totalIngredientsFloat[i] - defaultProduce.totalIngredientsFloat[i];
        }
      }
    }
    return { supportedRelevant, supportedFillers };
  }

  private calculateContributionForTeam(params: {
    recipe: Recipe;
    currentPokemon: SetCoverPokemonSetupWithSettings;
    team: SetCoverPokemonSetup[];
    ownIngredientsRelevant: Int16Array;
    ownIngredientsFiller: Int16Array;
    supportedIngredientsRelevant?: Int16Array;
    supportedIngredientsFiller?: Int16Array;
  }) {
    const {
      recipe,
      currentPokemon,
      team,
      ownIngredientsRelevant,
      ownIngredientsFiller,
      supportedIngredientsRelevant,
      supportedIngredientsFiller
    } = params;
    const teamSize = team.length;
    const teamSizePenalty = this.teamSizePenalty(teamSize);

    const defaultCritMultiplier = AVERAGE_WEEKLY_CRIT_MULTIPLIER;
    const ownCritMultiplier = currentPokemon.critMultiplier;

    const { relevantValue: ownRelevantValue, fillerValue: ownFillerValue } = this.calculateContributedIngredientsValue(
      recipe,
      ownIngredientsRelevant,
      ownIngredientsFiller
    );

    // we calculate valueLeftInRecipe so we don't multiply crit multiplier twice to same ings for tasty chance mons
    const valueLeftInRecipe = recipe.valueMax - ownRelevantValue;
    let tastyChanceContribution =
      teamSizePenalty * (ownCritMultiplier * valueLeftInRecipe - defaultCritMultiplier * valueLeftInRecipe);
    if (tastyChanceContribution < 100 || !getPokemon(currentPokemon.pokemonSet.pokemon).skill.is(TastyChanceS)) {
      tastyChanceContribution = 0;
    }

    const { fillerValue: supportedFillerValue, relevantValue: supportedRelevantValue } =
      supportedIngredientsRelevant && supportedIngredientsFiller
        ? this.calculateContributedIngredientsValue(recipe, supportedIngredientsRelevant, supportedIngredientsFiller)
        : { fillerValue: 0, relevantValue: 0 };

    const recipeContribution = (recipe.valueMax / 3) * ownCritMultiplier * teamSizePenalty;

    const ownContribution = ownCritMultiplier * ownRelevantValue * teamSizePenalty + ownFillerValue;
    const supportedContribution = ownCritMultiplier * supportedRelevantValue * teamSizePenalty + supportedFillerValue;
    const contributedPower = ownContribution + supportedContribution + tastyChanceContribution + recipeContribution;

    return {
      contributedPower,
      skillValue: tastyChanceContribution + supportedContribution
    };
  }

  private teamSizePenalty(teamSize: number) {
    return Math.max(1 - (teamSize - 1) * 0.2, 0);
  }

  private calculateContributedIngredientsValue(
    recipe: Recipe,
    relevantProduced: Int16Array,
    fillerProduced: Int16Array
  ) {
    const recipeIngredients: Map<string, number> = new Map<string, number>();
    for (const { amount, ingredient } of recipe.ingredients) {
      recipeIngredients.set(ingredient.name, amount);
    }
    let relevantValue = 0;
    let fillerValue = 0;
    for (let i = 0; i < ingredient.TOTAL_NUMBER_OF_INGREDIENTS; ++i) {
      const ingredientData = ingredient.INGREDIENTS[i];
      const recipeAmount = recipeIngredients.get(ingredientData.name);
      if (recipeAmount) {
        const producedAmount = relevantProduced[i];
        if (producedAmount <= recipeAmount) {
          relevantValue += producedAmount * ingredientData.value;
        } else {
          relevantValue += recipeAmount * ingredientData.value;
          fillerValue += (producedAmount - recipeAmount) * ingredientData.taxedValue;
        }
      } else {
        fillerValue += fillerProduced[i] * ingredientData.taxedValue;
      }
    }

    const recipeBonus = 1 + recipe.bonus / 100;
    const maxLevelRecipeMultiplier = recipeLevelBonus[MAX_RECIPE_LEVEL];

    return {
      relevantValue: relevantValue * recipeBonus * maxLevelRecipeMultiplier,
      fillerValue
    };
  }

  private calculateFinalContribution(data: PokemonWithRecipeContributionsRaw): PokemonWithFinalContribution {
    const { pokemonWithSettings, contributions } = data;

    const bestXRecipes = contributions
      .sort((a, b) => b.contributedPower - a.contributedPower)
      .slice(0, NUMBER_OF_MEALS);

    const bestXRecipesWithBoost = this.boostFirstXRecipesWithFactor({
      nrOfRecipesToBoost: 1,
      factor: 1.5,
      recipes: bestXRecipes
    });

    return {
      pokemonWithSettings: {
        pokemon: pokemonWithSettings.pokemonSet.pokemon,
        ingredientList: simplifyIngredientSet(pokemonWithSettings.ingredientList),
        totalIngredients: pokemonWithSettings.totalIngredientsFloat,
        critMultiplier: pokemonWithSettings.critMultiplier,
        averageWeekdayPotSize: pokemonWithSettings.averageWeekdayPotSize,
        settings: {
          ...pokemonWithSettings.settings,
          nature: pokemonWithSettings.settings.nature.name,
          subskills: [...pokemonWithSettings.settings.subskills]
        }
      },
      contributions: bestXRecipesWithBoost.map((recipeWithContributions) => ({
        coverage: recipeWithContributions.coverage,
        skillValue: recipeWithContributions.skillValue,
        score: recipeWithContributions.contributedPower,
        recipe: recipeWithContributions.recipe.name,
        team: recipeWithContributions.team.map((member) => ({
          pokemon: member.pokemonSet.pokemon,
          ingredientList: simplifyIngredientSet(member.ingredientList),
          nature: member.settings.nature.name,
          subskills: [...member.settings.subskills],
          totalProduction: member.totalIngredientsFloat
        }))
      })),
      score: bestXRecipesWithBoost.reduce((acc, recipe) => acc + recipe.contributedPower, 0)
    };
  }

  private boostFirstXRecipesWithFactor(params: {
    nrOfRecipesToBoost: number;
    factor: number;
    recipes: RecipeContribution[];
  }) {
    const { nrOfRecipesToBoost, factor, recipes } = params;
    const boostedRecipes = recipes.slice(0, nrOfRecipesToBoost).map((recipe) => ({
      ...recipe,
      contributedPower: recipe.contributedPower * factor,
      skillValue: recipe.skillValue * factor
    }));

    return [...boostedRecipes, ...recipes.slice(nrOfRecipesToBoost, recipes.length)];
  }

  tierAndDiff(current: PokemonWithFinalContribution[], previous: PokemonWithTiering[]): PokemonWithTiering[] {
    const tiers: { tier: Tier; bucket: number }[] = [
      { tier: 'S', bucket: 0.8 },
      { tier: 'A', bucket: 0.8 },
      { tier: 'B', bucket: 0.8 },
      { tier: 'C', bucket: 0.8 },
      { tier: 'D', bucket: 0.8 },
      { tier: 'E', bucket: 0.8 }
    ];

    const previousRanks = createTierlistIndex(previous.map((p) => p.pokemonWithSettings.pokemon));
    const currentRanks = createTierlistIndex(current.map((c) => c.pokemonWithSettings.pokemon));

    let topScoreOfTier = current[0].score;
    const minScore = current.at(-1)!.score;

    const tieredEntries: PokemonWithTiering[] = [];
    for (let i = 0; i < current.length; ++i) {
      const entry = current[i];
      let currentTier = tiers.at(0);
      if (currentTier && entry.score < currentTier.bucket * topScoreOfTier + (1 - currentTier.bucket) * minScore) {
        topScoreOfTier = entry.score;
        tiers.shift();
        currentTier = tiers.at(0);
      }

      const currentRank = currentRanks.get(entry.pokemonWithSettings.pokemon);
      const previousRank = previousRanks.get(entry.pokemonWithSettings.pokemon);

      const tier = currentTier?.tier ?? 'F';
      const diff = previousRank !== undefined && currentRank !== undefined ? previousRank - currentRank : undefined;

      tieredEntries.push({ ...entry, tier, diff });
    }

    return tieredEntries;
  }
}

export const CookingTierlist = new CookingTierlistImpl();
