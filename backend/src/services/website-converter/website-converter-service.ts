import { SurplusIngredients } from '../../domain/combination/combination';
import { CustomPokemonCombinationWithProduce } from '../../domain/combination/custom';
import { ProductionStats } from '../../domain/computed/production';
import { BuddyForFlexibleRanking, BuddyForMeal } from '../../domain/legacy/buddy-types';
import {
  AllCombinationsForMealType,
  CombinationForFlexibleRankingType,
  CombinationForFocusedRankingType,
} from '../../domain/legacy/legacy';
import { IngredientDrop } from '../../domain/produce/ingredient';
import { Nature } from '../../domain/stat/nature';
import { SubSkill } from '../../domain/stat/subskill';
import { OptimalFlexibleResult, OptimalSetResult } from '../../routes/optimal-router/optimal-router';
import { PokemonResult } from '../../routes/pokemon-router/pokemon-router';
import { TieredPokemonCombinationContribution } from '../../routes/tierlist-router/tierlist-router';
import { FLEXIBLE_BEST_RECIPE_PER_TYPE_MULTIPLIER } from '../../services/api-service/optimal/optimal-service';
import { roundDown } from '../../utils/calculator-utils/calculator-utils';
import { prettifyIngredientDrop, shortPrettifyIngredientDrop } from '../../utils/json/json-utils';
import { combineSameIngredientsInDrop } from '../calculator/ingredient/ingredient-calculate';

// --- production calculator
interface ProductionFilters {
  level: number;
  nature: Nature;
  subskills: SubSkill[];
  e4eProcs: number;
  helpingBonus: number;
  goodCamp: boolean;
}
interface ProductionCombination {
  filters: ProductionFilters;
  pokemonCombination: CustomPokemonCombinationWithProduce;
}
interface ProductionCombinations {
  filters: ProductionFilters;
  pokemonCombinations: CustomPokemonCombinationWithProduce[];
}

class WebsiteConverterServiceImpl {
  public toProductionCalculator(pokemonProduction: ProductionCombinations) {
    return {
      details: pokemonProduction.filters,
      combinations: pokemonProduction.pokemonCombinations.map((pokemonCombination) => ({
        details: this.#prettifyProductionDetails({
          pokemonCombination: pokemonCombination,
          filters: pokemonProduction.filters,
        }),
        pokemon: `${pokemonCombination.pokemonCombination.pokemon.name}
        ${shortPrettifyIngredientDrop(pokemonCombination.pokemonCombination.ingredientList)}
        ${prettifyIngredientDrop(pokemonCombination.detailedProduce.produce.ingredients)}`,
      })),
    };
  }

  public toTierList(tieredData: TieredPokemonCombinationContribution[]) {
    const mapWithTiering: Map<string, { pokemon: string; ingredientList: string; details: string }[]> = new Map();
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
        details: allEntriesOfPokemon
          .map(
            ({ tier, pokemonCombinationContribution: otherPairingsEntry }) =>
              `[${tier}] (${prettifyIngredientDrop(
                otherPairingsEntry.pokemonCombination.ingredientList
              )})\nTotal score: ${roundDown(
                otherPairingsEntry.combinedContribution.score,
                0
              )}\n${otherPairingsEntry.combinedContribution.contributions
                .map(
                  (meal) =>
                    `[${roundDown(meal.contributedPower, 0)} ${roundDown(meal.percentage, 1)}%] ${meal.meal.name
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
      pokemonWithDetails: { pokemon: string; ingredientList: string; details: string }[];
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
      details: `👨🏻‍🍳 Sleep API - Team finder 👨🏻‍🍳\n\nRecipe: ${
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
            )}`
        )
        .join('\n')}`,
    }));

    return {
      meal: optimalCombinations.meal,
      info:
        optimalCombinations.teams.length > 0
          ? `Requires ${optimalCombinations.teams.at(0)?.team.length} Pokémon for 100% coverage, showing ${
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

  public toFlexibleRanking(data: CombinationForFlexibleRankingType[]) {
    const prettifiedCombinations = data.map((combination, i) => {
      return `#${i + 1}: ${combination.pokemon} - AVG%(${roundDown(
        combination.averagePercentage,
        1
      )}%) - ${prettifyIngredientDrop(combination.ingredientList)}`;
    });
    return prettifiedCombinations;
  }

  public toFocusedRanking(data: CombinationForFocusedRankingType[]) {
    const prettifiedCombinations = data.map((combination, i) => {
      return `#${i + 1}: ${combination.pokemon} ${combination.total} - (${
        combination.meals
      }) - ${prettifyIngredientDrop(combination.ingredientList)}`;
    });
    return prettifiedCombinations;
  }

  public toFlexibleBuddyRanking(data: BuddyForFlexibleRanking[], queryPage?: number) {
    const page = queryPage ?? 1;
    const offset = page * 10 - 10;

    const prettifiedCombinations = data.map((combination, i) => {
      return `#${i + 1 + offset} [${combination.buddy1_pokemon}+${combination.buddy2_pokemon}] - AVG%(${roundDown(
        combination.average_percentage,
        1
      )}%) - [${prettifyIngredientDrop(combination.buddy1_ingredientList)} + ${prettifyIngredientDrop(
        combination.buddy2_ingredientList
      )}]`;
    });
    return prettifiedCombinations;
  }

  public toMealRanking(data: AllCombinationsForMealType) {
    const prettifiedRecipe = prettifyIngredientDrop(data.recipe);
    const prettifiedCombinations = data.combinations.map((combination, i) => {
      return `#${i + 1}: ${combination.pokemon} ${combination.percentage}% (${prettifyIngredientDrop(
        combination.producedIngredients.map((ing) => ({
          amount: roundDown(ing.amount, 1),
          ingredient: ing.ingredient,
        }))
      )}) - (${prettifyIngredientDrop(combination.ingredientList)})`;
    });
    return {
      meal: data.meal,
      recipe: prettifiedRecipe,
      bonus: data.bonus,
      value: data.value,
      combinations: prettifiedCombinations,
    };
  }

  public toPokemonRanking(data: PokemonResult[]) {
    return data.map((pokemonCombination) => {
      return {
        pokemon: pokemonCombination.pokemon,
        ingredientList: prettifyIngredientDrop(pokemonCombination.ingredientList),
        ingredientsProduced: prettifyIngredientDrop(
          pokemonCombination.ingredientsProduced.map((ing) => ({
            amount: roundDown(ing.amount, 1),
            ingredient: ing.ingredient,
          }))
        ),
        generalist_ranking: pokemonCombination.generalistRanking,
        average_percentage: `${pokemonCombination.averagePercentage}%`,
        meals: pokemonCombination.meals.map((meal) => `${meal.percentage}% ${meal.meal}`),
      };
    });
  }

  public toBuddyForMealRanking(data: BuddyForMeal, queryPage?: number) {
    const page = queryPage ?? 1;
    const offset = page * 100 - 100;

    return {
      meal: data.meal,
      recipe: prettifyIngredientDrop(data.recipe),
      bonus: data.bonus,
      value: data.value,
      buddies: data.combinations.map((combination, i) => {
        return `#${i + 1 + offset} [${combination.buddy1_pokemon}+${combination.buddy2_pokemon}] ${
          combination.percentage
        }% (${prettifyIngredientDrop(
          combineSameIngredientsInDrop([
            ...combination.buddy1_producedIngredients,
            ...combination.buddy2_producedIngredients,
          ])
        )}) - [${prettifyIngredientDrop(combination.buddy1_ingredientList)} + ${prettifyIngredientDrop(
          combination.buddy2_ingredientList
        )}]`;
      }),
    };
  }

  #prettifyProductionDetails(productionCombination: ProductionCombination) {
    const filters = productionCombination.filters;
    const pokemonCombination = productionCombination.pokemonCombination;
    let prettyString = `👨🏻‍🍳 Sleep API - Production calculator 👨🏻‍🍳\n\n${
      pokemonCombination.pokemonCombination.pokemon.name
    }(${shortPrettifyIngredientDrop(pokemonCombination.pokemonCombination.ingredientList)})\n`;

    prettyString += `-------------\n`;

    prettyString += `Level: ${pokemonCombination.customStats.level}, Nature: ${pokemonCombination.customStats.nature.prettyName}\n`;
    prettyString += `Subskills: ${
      pokemonCombination.customStats.subskills.length > 0
        ? pokemonCombination.customStats.subskills.map((s) => s.name).join(', ')
        : 'None'
    }\n`;

    const e4eHbCamp: string[] = [];
    if (filters.e4eProcs > 0) {
      e4eHbCamp.push(`E4E: ${filters.e4eProcs} x 18 energy`);
    }
    if (filters.helpingBonus > 0) {
      e4eHbCamp.push(`Helping bonus: ${filters.helpingBonus}`);
    }
    if (filters.goodCamp) {
      e4eHbCamp.push(`Good camp: ${filters.goodCamp}`);
    }
    prettyString += e4eHbCamp.join(', ');
    if (e4eHbCamp.length > 0) {
      prettyString += '\n';
    }

    prettyString += `-------------\n`;

    prettyString += `Total berry output per 24h: ${roundDown(
      pokemonCombination.detailedProduce.produce.berries.amount + pokemonCombination.detailedProduce.sneakySnack.amount,
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
      pokemonWithDetails: { pokemon: string; ingredientList: string; details: string }[];
    }[]
  ) {
    const seen = new Set<string>();
    const filtered: Map<string, { pokemon: string; ingredientList: string; details: string }[]> = new Map();
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
      pokemonWithDetails: { pokemon: string; ingredientList: string; details: string }[];
    }[] = [];
    for (const [tier, pokemonWithDetails] of filtered) {
      filteredArray.push({ tier, pokemonWithDetails });
    }

    return filteredArray;
  }

  #prettifyInput(details: ProductionStats) {
    let prettyString = '\n-------------\n';

    prettyString += `Level: ${details.level}` + `, Nature: ${details.nature.prettyName}` + '\n';
    prettyString += `Subskills: ${details.subskills?.map((s) => s.name).join(', ') ?? 'None'}\n`;

    const e4eHbCamp: string[] = [];
    if (details.e4eProcs > 0) {
      e4eHbCamp.push(`E4E: ${details.e4eProcs} x 18 energy`);
    }
    if (details.helpingBonus > 0) {
      e4eHbCamp.push(`Helping bonus: ${details.helpingBonus}`);
    }
    if (details.goodCamp) {
      e4eHbCamp.push(`Good camp: ${details.goodCamp}`);
    }
    prettyString += e4eHbCamp.join(', ');
    if (e4eHbCamp.length > 0) {
      prettyString += '\n';
    }
    prettyString += `-------------\n`;

    return prettyString;
  }

  #prettifyFillersForRecipe(recipe: IngredientDrop[], surplus: SurplusIngredients): string {
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
