import { SurplusIngredients } from '@src/domain/combination/combination';
import { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom';
import { ProductionStats } from '@src/domain/computed/production';
import { ScheduledEvent } from '@src/domain/event/event';
import { Summary } from '@src/domain/event/events/summary-event/summary-event';
import { OptimalFlexibleResult, OptimalSetResult } from '@src/routes/optimal-router/optimal-router';
import { TieredPokemonCombinationContribution } from '@src/routes/tierlist-router/tierlist-router';
import { roundDown } from '@src/utils/calculator-utils/calculator-utils';
import { prettifyIngredientDrop, shortPrettifyIngredientDrop } from '@src/utils/json/json-utils';
import { IngredientSet, MEALS_IN_DAY, mainskill, nature, subskill } from 'sleepapi-common';
import { FLEXIBLE_BEST_RECIPE_PER_TYPE_MULTIPLIER } from '../api-service/optimal/optimal-service';
import { calculateHelperBoostHelpsFromUnique } from '../calculator/skill/skill-calculator';

// --- production calculator
interface ProductionFilters {
  level: number;
  nature: nature.Nature;
  subskills: subskill.SubSkill[];
  e4eProcs: number;
  e4eLevel: number;
  helperBoostProcs: number;
  helperBoostUnique: number;
  helperBoostLevel: number;
  helpingBonus: number;
  camp: boolean;
}
interface ProductionCombination {
  filters: ProductionFilters;
  pokemonProduction: CustomPokemonCombinationWithProduce;
  summary: Summary;
}
interface ProductionCombinations {
  filters: ProductionFilters;
  production: { pokemonProduction: CustomPokemonCombinationWithProduce; log: ScheduledEvent[]; summary: Summary };
  allIngredientSets: {
    pokemonProduction: CustomPokemonCombinationWithProduce;
    log: ScheduledEvent[];
    summary: Summary;
  }[];
}

class WebsiteConverterServiceImpl {
  public toProductionCalculator(pokemonProductions: ProductionCombinations) {
    return {
      details: pokemonProductions.filters,
      production: {
        details: this.#prettifyProductionDetails({
          pokemonProduction: pokemonProductions.production.pokemonProduction,
          filters: pokemonProductions.filters,
          summary: pokemonProductions.production.summary,
        }),
        pokemon: pokemonProductions.production.pokemonProduction.pokemonCombination.pokemon.name,
        ingredients: pokemonProductions.production.pokemonProduction.pokemonCombination.ingredientList.map(
          (ing) => ing.ingredient.name
        ),
        log: pokemonProductions.production.log,
        logName: `eventlog-${pokemonProductions.production.pokemonProduction.pokemonCombination.pokemon.name}${
          pokemonProductions.filters.level
        }-${Date.now()}.txt`,
        prettyLog: pokemonProductions.production.log.map((event) => event.format()).join('\n'),
      },
      allIngredientSets: {
        pokemon: 'Production comparison',
        details:
          `👨🏻‍🍳 Production Comparison 👨🏻‍🍳\nhttps://sleepapi.net\n\n${
            pokemonProductions.production.pokemonProduction.pokemonCombination.pokemon.name
          }\n${this.#prettifyFiltersDetails({
            pokemonProduction: pokemonProductions.production.pokemonProduction,
            filters: pokemonProductions.filters,
            summary: pokemonProductions.production.summary,
          })}` +
          pokemonProductions.allIngredientSets
            .map(
              ({ pokemonProduction }) =>
                `${shortPrettifyIngredientDrop(pokemonProduction.pokemonCombination.ingredientList)}\n` +
                `Ingredients per meal window: ${prettifyIngredientDrop(
                  pokemonProduction.detailedProduce.produce.ingredients
                )}\n` +
                `Total berry output per 24h: ${roundDown(
                  pokemonProductions.production.pokemonProduction.detailedProduce.produce.berries.amount,
                  1
                )} ${pokemonProductions.production.pokemonProduction.pokemonCombination.pokemon.berry.name}`
            )
            .join('\n\n'),
      },
    };
  }

  public toTierList(tieredData: TieredPokemonCombinationContribution[]) {
    const mapWithTiering: Map<string, { pokemon: string; ingredientList: string; diff?: number; details: string }[]> =
      new Map();
    for (const tieredEntry of tieredData) {
      const allEntriesOfPokemon = tieredData.filter(
        (allPokemon) =>
          allPokemon.pokemonCombinationContribution.pokemonCombination.pokemon.name ===
          tieredEntry.pokemonCombinationContribution.pokemonCombination.pokemon.name
      );

      const prettyEntry = {
        pokemon: tieredEntry.pokemonCombinationContribution.pokemonCombination.pokemon.name,
        ingredientList: prettifyIngredientDrop(
          tieredEntry.pokemonCombinationContribution.pokemonCombination.ingredientList
        ),
        diff: tieredEntry.diff,
        details: allEntriesOfPokemon
          .map(
            ({ tier, pokemonCombinationContribution: otherPairingsEntry }) =>
              `[${tier}] (${prettifyIngredientDrop(otherPairingsEntry.pokemonCombination.ingredientList)})\n` +
              `Total score: ${Math.round(otherPairingsEntry.combinedContribution.score)}` +
              `${
                (otherPairingsEntry.combinedContribution.contributions[0].skillValue ?? 0) > 0
                  ? `, support value: ${Math.round(
                      otherPairingsEntry.combinedContribution.contributions.reduce(
                        (sum, cur) => sum + (cur.skillValue ?? 0),
                        0
                      )
                    )}`
                  : ''
              }\n` +
              `${otherPairingsEntry.combinedContribution.contributions
                .map(
                  (meal) =>
                    `[${Math.round(meal.contributedPower)} ${roundDown(meal.percentage, 1)}%] ${meal.meal.name
                      .toLowerCase()
                      .replace(/_/g, ' ')}`
                )
                .join('\n')}`
          )
          .join('\n\n'),
      };

      if (!mapWithTiering.has(tieredEntry.tier)) {
        mapWithTiering.set(tieredEntry.tier, [prettyEntry]);
      } else {
        const array = mapWithTiering.get(tieredEntry.tier);
        if (array !== undefined) {
          array.push(prettyEntry);
        }
      }
    }

    const tiersWithPokemonDetails: {
      tier: string;
      pokemonWithDetails: { pokemon: string; ingredientList: string; diff?: number; details: string }[];
    }[] = [];
    for (const [tier, pokemonWithDetails] of mapWithTiering) {
      tiersWithPokemonDetails.push({ tier, pokemonWithDetails });
    }

    return this.#filterOnlyBest(tiersWithPokemonDetails);
  }

  public toOptimalSet(optimalCombinations: OptimalSetResult) {
    const prettifiedRecipe = prettifyIngredientDrop(optimalCombinations.recipe);
    const prettifiedCombinations = optimalCombinations.teams.slice(0, 500).map((solution) => ({
      team: solution.team
        .map(
          (member) =>
            `${member.pokemonCombination.pokemon.name}(${shortPrettifyIngredientDrop(
              member.pokemonCombination.ingredientList
            )})`
        )
        .join(', '),
      details: `👨🏻‍🍳 Team finder - https://sleepapi.net 👨🏻‍🍳\n\nRecipe: ${
        optimalCombinations.meal
      } (${prettifiedRecipe})\n\nTeam\n- ${solution.team
        .map(
          (member) =>
            `${member.pokemonCombination.pokemon.name}(${shortPrettifyIngredientDrop(
              member.pokemonCombination.ingredientList
            )})`
        )
        .join('\n- ')}\n${this.#prettifyInput(optimalCombinations.filter)}\nFiller ingredients produced\n${
        solution.surplus.relevant.length > 0
          ? `${this.#prettifyFillersForRecipe(optimalCombinations.recipe, solution.surplus)}`
          : ''
      }\n\nIndividual produce per meal window\n${solution.team
        .map(
          (member) =>
            `${member.pokemonCombination.pokemon.name}: ${prettifyIngredientDrop(
              member.detailedProduce.produce.ingredients
            )} (${roundDown(member.detailedProduce.averageTotalSkillProcs / MEALS_IN_DAY, 1)} skill procs)`
        )
        .join('\n')}`,
    }));

    return {
      meal: optimalCombinations.meal,
      info:
        optimalCombinations.teams.length > 0
          ? !optimalCombinations.teams.at(0)?.exhaustive
            ? `Requires ${optimalCombinations.teams.at(0)?.team.length} Pokémon for 100% coverage, showing ${
                prettifiedCombinations.length
              } of ${
                optimalCombinations.teams.length
              } solutions.\nTimeout of 10 seconds reached, results may not be exhaustive`
            : `Requires ${optimalCombinations.teams.at(0)?.team.length} Pokémon for 100% coverage, showing ${
                prettifiedCombinations.length
              } of ${optimalCombinations.teams.length} solutions`
          : 'No possible team combinations for 100% coverage found, cant be made with current filter',
      recipe: prettifiedRecipe,
      bonus: optimalCombinations.bonus,
      value: optimalCombinations.value,
      teams: prettifiedCombinations,
    };
  }

  public toOptimalFlexible(pokemonCombinationCombinedContributions: OptimalFlexibleResult[]) {
    return pokemonCombinationCombinedContributions.map((pokemonCombinationWithContribution, i) => {
      const mealsMap = new Map(
        pokemonCombinationWithContribution.scoreResult.contributions.map((contribution) => [
          contribution.meal.name,
          contribution.contributedPower,
        ])
      );

      const meals = pokemonCombinationWithContribution.scoreResult.contributions.map(
        (contribution) => `[${contribution.contributedPower}] ${contribution.meal.name}`
      );

      const countedMeals = pokemonCombinationWithContribution.scoreResult.countedMeals.map((contribution) => {
        const basePower = mealsMap.get(contribution.meal.name);
        const is20PercentHigher =
          basePower && contribution.contributedPower === basePower * FLEXIBLE_BEST_RECIPE_PER_TYPE_MULTIPLIER;

        const powerDisplay = is20PercentHigher
          ? `[${roundDown(
              contribution.contributedPower / FLEXIBLE_BEST_RECIPE_PER_TYPE_MULTIPLIER,
              0
            )} x ${FLEXIBLE_BEST_RECIPE_PER_TYPE_MULTIPLIER})]`
          : `[${roundDown(contribution.contributedPower, 0)}]`;

        return `${powerDisplay} ${contribution.meal.name}`;
      });

      return {
        pokemon: pokemonCombinationWithContribution.pokemonCombination.pokemon.name,
        ingredientList: pokemonCombinationWithContribution.pokemonCombination.ingredientList,
        score: roundDown(pokemonCombinationWithContribution.scoreResult.score, 0),
        rank: i + 1,
        meals,
        countedMeals,
        prettyPokemonCombination: `${
          pokemonCombinationWithContribution.pokemonCombination.pokemon.name
        } (${prettifyIngredientDrop(pokemonCombinationWithContribution.pokemonCombination.ingredientList)})`,
        input: this.#prettifyInput(pokemonCombinationWithContribution.input),
      };
    });
  }

  #prettifyFiltersDetails(productionCombination: ProductionCombination) {
    const filters = productionCombination.filters;
    const pokemonCombination = productionCombination.pokemonProduction;

    let prettyString = `-------------\n`;

    prettyString +=
      `Level: ${pokemonCombination.customStats.level}, Nature: ${pokemonCombination.customStats.nature.prettyName}\n` +
      `Main skill level: ${pokemonCombination.customStats.skillLevel}\n` +
      `Subskills: ${
        pokemonCombination.customStats.subskills.length > 0
          ? pokemonCombination.customStats.subskills.map((s) => s.name).join(', ')
          : 'None'
      }\n`;

    const teamInput: string[] = [];
    if (filters.e4eProcs > 0) {
      teamInput.push(`E4E: ${filters.e4eProcs} x 18 energy`);
    }
    if (filters.helperBoostProcs > 0) {
      teamInput.push(
        `Helper boost: ${filters.helperBoostProcs} x ${
          mainskill.HELPER_BOOST.amount[filters.helperBoostLevel - 1] +
          calculateHelperBoostHelpsFromUnique(filters.helperBoostUnique, filters.helperBoostLevel)
        } helps`
      );
    }
    if (filters.helpingBonus > 0) {
      teamInput.push(`Helping bonus: ${filters.helpingBonus}`);
    }
    if (filters.camp) {
      teamInput.push(`Good camp: ${filters.camp}`);
    }
    prettyString += teamInput.join(', ');
    if (teamInput.length > 0) {
      prettyString += '\n';
    }

    prettyString += `-------------\n`;
    return prettyString;
  }

  #prettifyProductionDetails(productionCombination: ProductionCombination) {
    const pokemonCombination = productionCombination.pokemonProduction;
    const summary = productionCombination.summary;

    let prettyString = `👨🏻‍🍳 Production Calculator 👨🏻‍🍳\nhttps://sleepapi.net\n\n${
      pokemonCombination.pokemonCombination.pokemon.name
    }(${shortPrettifyIngredientDrop(pokemonCombination.pokemonCombination.ingredientList)})\n`;

    prettyString += this.#prettifyFiltersDetails(productionCombination);

    prettyString += `Estimated skill procs: ${roundDown(
      pokemonCombination.detailedProduce.averageTotalSkillProcs,
      1
    )}\n`;

    // skill values
    const {
      skillEnergySelfValue,
      skillEnergyOthersValue,
      skillProduceValue,
      skillStrengthValue,
      skillDreamShardValue,
      skillPotSizeValue,
      skillHelpsValue,
      skillTastyChanceValue,
    } = summary;
    const prettifiedSkillProduce: string[] = [];
    if (skillProduceValue.berries.amount > 0) {
      prettifiedSkillProduce.push(
        `${roundDown(skillProduceValue.berries.amount, 2)} ${skillProduceValue.berries.berry.name}`
      );
    }
    if (skillProduceValue.ingredients.length > 0) {
      prettifiedSkillProduce.push(
        `${prettifyIngredientDrop(
          skillProduceValue.ingredients.map(({ amount, ingredient }) => ({
            amount: roundDown(amount, 1),
            ingredient,
          }))
        )}`
      );
    }
    prettyString +=
      (skillEnergySelfValue > 0 ? `Energy self skill value: ${roundDown(skillEnergySelfValue, 2)} energy\n` : '') +
      (skillEnergyOthersValue > 0
        ? `Energy team skill value: ${roundDown(skillEnergyOthersValue, 2)} energy / member\n`
        : '') +
      (skillHelpsValue > 0 ? `Helps team skill value: ${roundDown(skillHelpsValue, 2)} helps / member\n` : '') +
      (skillStrengthValue > 0 ? `Strength skill value: ${Math.floor(skillStrengthValue)} strength\n` : '') +
      (skillDreamShardValue > 0 ? `Dream shards skill value: ${Math.floor(skillDreamShardValue)} shards\n` : '') +
      (skillPotSizeValue > 0 ? `Pot size skill value: ${roundDown(skillPotSizeValue, 2)} pot size\n` : '') +
      (skillTastyChanceValue > 0
        ? `Tasty chance skill value: ${roundDown(skillTastyChanceValue, 2)}% crit chance\n`
        : '') +
      (prettifiedSkillProduce.length > 0 ? `Produce skill value: ${prettifiedSkillProduce.join(' + ')}\n` : '');

    prettyString += `Total berry output per 24h: ${roundDown(
      pokemonCombination.detailedProduce.produce.berries.amount,
      1
    )} ${pokemonCombination.pokemonCombination.pokemon.berry.name}\n`;

    const maybeSpilledIngredients =
      pokemonCombination.detailedProduce.spilledIngredients.length > 0
        ? prettifyIngredientDrop(pokemonCombination.detailedProduce.spilledIngredients)
        : 'None';
    prettyString += `Spilled ingredients at night: ${maybeSpilledIngredients}\n\n`;

    prettyString += `Total ingredient output per meal window\n${prettifyIngredientDrop(
      pokemonCombination.detailedProduce.produce.ingredients
    )}`;

    return prettyString;
  }

  #filterOnlyBest(
    tiersWithPokemonDetails: {
      tier: string;
      pokemonWithDetails: { pokemon: string; ingredientList: string; diff?: number; details: string }[];
    }[]
  ) {
    const seen = new Set<string>();
    const filtered: Map<string, { pokemon: string; ingredientList: string; diff?: number; details: string }[]> =
      new Map();
    for (const tier of tiersWithPokemonDetails) {
      for (const pokemon of tier.pokemonWithDetails) {
        if (!seen.has(pokemon.pokemon)) {
          seen.add(pokemon.pokemon);

          if (!filtered.has(tier.tier)) {
            filtered.set(tier.tier, [pokemon]);
          } else {
            const array = filtered.get(tier.tier);
            if (array !== undefined) {
              array.push(pokemon);
            }
          }
        }
      }
    }
    const filteredArray: {
      tier: string;
      pokemonWithDetails: { pokemon: string; ingredientList: string; diff?: number; details: string }[];
    }[] = [];
    for (const [tier, pokemonWithDetails] of filtered) {
      filteredArray.push({ tier, pokemonWithDetails });
    }

    return filteredArray;
  }

  #prettifyInput(details: ProductionStats) {
    let prettyString = '\n-------------\n';

    prettyString += `Level: ${details.level}` + `, Nature: ${details.nature?.prettyName ?? 'None'}` + '\n';
    prettyString += `Subskills: ${details.subskills?.map((s) => s.name).join(', ') ?? 'None'}\n`;

    const teamInput: string[] = [];
    if (details.e4eProcs > 0) {
      teamInput.push(`E4E: ${details.e4eProcs} x 18 energy`);
    }
    if (details.helperBoostProcs > 0) {
      teamInput.push(
        `Helper boost: ${details.helperBoostProcs} x ${
          mainskill.HELPER_BOOST.amount[details.helperBoostLevel - 1] +
          calculateHelperBoostHelpsFromUnique(details.helperBoostUnique, details.helperBoostLevel)
        } helps`
      );
    }
    if (details.helpingBonus > 0) {
      teamInput.push(`Helping bonus: ${details.helpingBonus}`);
    }
    if (details.camp) {
      teamInput.push(`Good camp: ${details.camp}`);
    }
    prettyString += teamInput.join(', ');
    if (teamInput.length > 0) {
      prettyString += '\n';
    }
    prettyString += `-------------\n`;

    return prettyString;
  }

  #prettifyFillersForRecipe(recipe: IngredientSet[], surplus: SurplusIngredients): string {
    const fillers = surplus.relevant.map((filler) => {
      const recipeIngredient = recipe.find((r) => r.ingredient.name === filler.ingredient.name);
      const percentage = recipeIngredient ? (filler.amount / recipeIngredient.amount) * 100 : 0;
      return `${roundDown(filler.amount, 1)} ${filler.ingredient.name} (${roundDown(percentage, 0)}%)`;
    });

    fillers.push(
      `${surplus.extra.map((filler) => `${roundDown(filler.amount, 1)} ${filler.ingredient.name} (N/A)`).join(', ')}`
    );

    return fillers.join(', ');
  }
}

export const WebsiteConverterService = new WebsiteConverterServiceImpl();
