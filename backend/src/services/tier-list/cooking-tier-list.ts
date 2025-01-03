import { BadRequestError } from '@src/domain/error/api/api-error.js';
import { ProgrammingError } from '@src/domain/error/programming/programming-error.js';
import { getAllIngredientLists } from '@src/services/calculator/ingredient/ingredient-calculate.js';
import { SetCover } from '@src/services/solve/set-cover.js';
import type {
  SetCoverPokemonSetup,
  SetCoverPokemonSetupWithSettings
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import {
  calculateProductionAll,
  convertAAAToAllIngredientSets,
  groupProducersByIngredientIndex,
  hashPokemonSetIndexed,
  pokedexToMembers
} from '@src/services/solve/utils/solve-utils.js';
import { BunUtils } from '@src/utils/bun-utils/bun-utils.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { Pokemon, Recipe, TierlistSettings } from 'sleepapi-common';
import {
  AVERAGE_WEEKLY_CRIT_MULTIPLIER,
  getPokemon,
  ingredient,
  INGREDIENT_SUPPORT_MAINSKILLS,
  ingredientSetToIntFlat,
  mainskill,
  MathUtils,
  MAX_RECIPE_LEVEL,
  MAX_TEAM_SIZE,
  OPTIMAL_POKEDEX,
  recipeCoverage,
  recipeLevelBonus,
  RECIPES,
  type SolveSettingsExt,
  type TeamMemberExt,
  type Time
} from 'sleepapi-common';

export interface RecipeContribution {
  team: SetCoverPokemonSetup[];
  recipe: Recipe;
  contributedPower: number;
  skillValue: number;
  coverage: number;
}
export interface PokemonWithRecipeContributions {
  pokemonWithSettings: SetCoverPokemonSetupWithSettings;
  contributions: RecipeContribution[];
}
export interface PokemonWithFinalContribution extends PokemonWithRecipeContributions {
  score: number;
}
// TODO: this type can be significantly reduced, theres a ton of duplicate info
export interface PokemonWithTiering extends PokemonWithFinalContribution {
  tier: Tier;
  diff?: number;
}
export type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

// TODO: can we make nrOfMeals to take into consideration a query param? More meals more flexible
const NUMBER_OF_MEALS = 3;

class CookingTierlistImpl {
  bedtime: Time = { hour: 21, minute: 30, second: 0 };
  wakeup: Time = { hour: 6, minute: 0, second: 0 };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async get(settings: TierlistSettings) {
    return this.fromFile(settings, 'current');
  }

  public async seed(settings: TierlistSettings) {
    const data: PokemonWithRecipeContributions[] = this.generate(settings);

    const combinedContributions: PokemonWithFinalContribution[] = [];
    for (let i = 0; i < data.length; ++i) {
      combinedContributions.push(this.calculateFinalContribution(data[i]));
    }
    combinedContributions.sort((a, b) => b.score - a.score);

    const previousData = await this.fromFile(settings, 'previous');
    const tieredData = this.tierAndDiff(combinedContributions, previousData);
    await this.toFile(settings, tieredData);

    BunUtils.garbageCollect();
    return;
  }

  private async fromFile(settings: TierlistSettings, version: 'current' | 'previous'): Promise<PokemonWithTiering[]> {
    const { level, camp } = settings;
    if (level !== 30 && level !== 60) {
      throw new BadRequestError('No tier list exists for level ' + level);
    }

    const dirName = join(__dirname, `../../data/tierlist/${version}/level${level}`);
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

    const dirName = join(__dirname, `../../data/tierlist/current/level${level}`);
    const filePath = join(dirName, `${camp ? 'camp' : 'regular'}.json`);
    await fs.mkdir(dirName, { recursive: true });

    const fileContents = JSON.stringify(data);
    return await fs.writeFile(filePath, fileContents, 'utf-8');
  }

  private generate(settings: TierlistSettings) {
    const { level, camp } = settings;
    const solveSettings: SolveSettingsExt = {
      bedtime: this.bedtime,
      camp,
      level,
      wakeup: this.wakeup
    };
    let counter = 0;
    // eslint-disable-next-line SleepAPILogger/no-console
    console.time('Tierlist default production');

    const { productionMap: defaultProductionMap, setCoverSetups } = this.calculateProductionAll({
      solveSettings,
      includeCooking: true
    });
    const defaultCache = new Map();
    const defaultSetCover = new SetCover(groupProducersByIngredientIndex(setCoverSetups), defaultCache);

    // eslint-disable-next-line SleepAPILogger/no-console
    console.timeEnd('Tierlist default production');
    const result: PokemonWithRecipeContributions[] = [];

    // TODO: split into functions
    for (const pkmn of OPTIMAL_POKEDEX) {
      const isSupport = INGREDIENT_SUPPORT_MAINSKILLS.some((skill) => skill.isSkill(pkmn.skill));

      const { supportProductionMap, pokemonIngredientLists, supportSetCoverSetups } =
        this.getIngredientListsAndSupportMap({
          isSupport,
          pkmn,
          solveSettings,
          defaultProductionMap
        });

      for (const pokemonWithIngredients of pokemonIngredientLists) {
        const currentMemoryUsage = process.memoryUsage().heapUsed;
        const currentMemoryUsageGigabytes = currentMemoryUsage / 1024 ** 3;
        ++counter;
        logger.info('Current memory usage: ' + MathUtils.round(currentMemoryUsageGigabytes, 3) + ' GB');
        // eslint-disable-next-line SleepAPILogger/no-console
        console.time(
          `[${counter}/${OPTIMAL_POKEDEX.length * pokemonIngredientLists.length}] ${pokemonWithIngredients.pokemonSet.pokemon}`
        );

        // TODO: we only have to filter pot size every 6th
        const recipesToCook = this.getRecipesWithinPotLimit(pokemonWithIngredients.averageWeekdayPotSize);
        const contributions: RecipeContribution[] = [];

        // TODO: can we worker thread this?
        for (const recipe of recipesToCook) {
          const recipeContribution = this.calculateRecipeContribution({
            recipe,
            currentPokemon: pokemonWithIngredients,
            setCover: isSupport
              ? new SetCover(groupProducersByIngredientIndex(supportSetCoverSetups), new Map())
              : defaultSetCover,
            isSupport,
            defaultProduceMap: defaultProductionMap,
            supportProduceMap: supportProductionMap
          });

          recipeContribution && contributions.push(recipeContribution);
        }

        // eslint-disable-next-line SleepAPILogger/no-console
        console.timeEnd(
          // TODO: this doesnt work because some mons only have 4 ing lists
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
    solveSettings: SolveSettingsExt;
    includeCooking: boolean;
    supportMember?: TeamMemberExt;
  }): {
    productionMap: Map<string, SetCoverPokemonSetupWithSettings>;
    setCoverSetups: SetCoverPokemonSetupWithSettings[];
    userProduction: SetCoverPokemonSetupWithSettings;
  } {
    const { solveSettings, includeCooking, supportMember } = params;
    const productionMap: Map<string, SetCoverPokemonSetupWithSettings> = new Map();
    const setCoverSetups: SetCoverPokemonSetupWithSettings[] = [];

    const { userProduction, nonSupportProduction, supportProduction } = calculateProductionAll({
      settings: solveSettings,
      userMembers: supportMember ? [supportMember] : [],
      includeCooking
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
    solveSettings: SolveSettingsExt;
    defaultProductionMap: Map<string, SetCoverPokemonSetupWithSettings>;
  }): {
    supportProductionMap?: Map<string, SetCoverPokemonSetupWithSettings>;
    pokemonIngredientLists: SetCoverPokemonSetupWithSettings[];
    supportSetCoverSetups: SetCoverPokemonSetupWithSettings[];
  } {
    const { pkmn, isSupport, solveSettings, defaultProductionMap } = params;
    const pokemonIngredientLists: SetCoverPokemonSetupWithSettings[] = [];

    // if this is a support mon
    // re-calculate production for all other pokemon with this support mon included in team
    if (isSupport) {
      const supportMember: TeamMemberExt = pokedexToMembers({
        pokedex: [pkmn],
        level: solveSettings.level,
        camp: solveSettings.camp
      })[0];

      const {
        productionMap,
        userProduction: userAAA,
        setCoverSetups
      } = this.calculateProductionAll({
        solveSettings,
        includeCooking: false,
        supportMember
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
    let team: SetCoverPokemonSetup[] = [];
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
    if (
      tastyChanceContribution < 100 ||
      !getPokemon(currentPokemon.pokemonSet.pokemon).skill.isSameOrModifiedVersionOf(mainskill.TASTY_CHANCE_S)
    ) {
      tastyChanceContribution = 0;
    }

    const { fillerValue: supportedFillerValue, relevantValue: supportedRelevantValue } =
      supportedIngredientsRelevant && supportedIngredientsFiller
        ? this.calculateContributedIngredientsValue(recipe, supportedIngredientsRelevant, supportedIngredientsFiller)
        : { fillerValue: 0, relevantValue: 0 };

    // if (
    //   currentPokemon.pokemonSet.pokemon === 'BLASTOISE' &&
    //   currentPokemon.ingredientList[1].ingredient.name === 'Cacao' &&
    //   currentPokemon.ingredientList[2].ingredient.name === 'Cacao'
    // ) {
    //   logger.error(currentPokemon.totalIngredients);
    //   logger.error(ownFillerValue);
    //   logger.error(ownRelevantValue);
    //   logger.error(supportedFillerValue);
    //   logger.error(supportedRelevantValue);
    //   throw new Error('Blastoise');
    // }
    const ownContribution = ownCritMultiplier * ownRelevantValue * teamSizePenalty + ownFillerValue;
    // TODO: doesn't seem to work for extra helpful?
    const supportedContribution = ownCritMultiplier * supportedRelevantValue * teamSizePenalty + supportedFillerValue;
    const contributedPower = ownContribution + supportedContribution + tastyChanceContribution;

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

  private calculateFinalContribution(data: PokemonWithRecipeContributions): PokemonWithFinalContribution {
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
      pokemonWithSettings,
      contributions: bestXRecipesWithBoost,
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

  private tierAndDiff(current: PokemonWithFinalContribution[], previous: PokemonWithTiering[]): PokemonWithTiering[] {
    const tiers: { tier: Tier; bucket: number }[] = [
      { tier: 'S', bucket: 0.9 },
      { tier: 'A', bucket: 0.8 },
      { tier: 'B', bucket: 0.8 },
      { tier: 'C', bucket: 0.85 },
      { tier: 'D', bucket: 0.85 },
      { tier: 'E', bucket: 0.9 }
    ];

    const previousTierlistIndices = this.createTierlistIndex(previous);
    let threshold = current[0].score;

    const tieredEntries: PokemonWithTiering[] = [];
    for (let i = 0; i < current.length; ++i) {
      const entry = current[i];
      let currentTier = tiers.at(0);
      if (currentTier && entry.score < currentTier.bucket * threshold) {
        threshold = entry.score;
        tiers.shift();
        currentTier = tiers.at(0);
      }

      const previousIndex: number | undefined = previousTierlistIndices.get(
        hashPokemonSetIndexed(entry.pokemonWithSettings.pokemonSet)
      );

      const tier = currentTier?.tier ?? 'F';
      const diff = previousIndex && previousIndex - i;

      tieredEntries.push({ ...entry, tier, diff });
    }

    return tieredEntries;
  }

  private createTierlistIndex(previous: PokemonWithTiering[]): Map<string, number> {
    const indexMap = new Map<string, number>();

    previous.forEach((entry, index) => {
      const hash = hashPokemonSetIndexed(entry.pokemonWithSettings.pokemonSet);
      indexMap.set(hash, index);
    });

    return indexMap;
  }
}

export const CookingTierlist = new CookingTierlistImpl();
