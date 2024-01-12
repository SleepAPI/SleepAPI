import { PokemonResult } from '@src/routes/pokemon-router/pokemon-router';
import { BuddyForFlexibleRanking, BuddyForMeal } from '../../domain/combination/buddy-types';
import {
  AllCombinationsForMealType,
  CombinationForFlexibleRankingType,
  CombinationForFocusedRankingType,
} from '../../domain/combination/combination';
import { CustomPokemonCombinationWithProduce } from '../../domain/combination/custom';
import { ProductionFilter } from '../../domain/computed/production';
import { Nature } from '../../domain/stat/nature';
import { SubSkill } from '../../domain/stat/subskill';
import { OptimalSetResult, OptimalTeamType } from '../../routes/optimal-router/optimal-router';
import { TieredPokemonCombinationContribution } from '../../routes/tierlist-router/tierlist-router';
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
                otherPairingsEntry.combinedContribution.summedContributedPower,
                0
              )}\n${otherPairingsEntry.combinedContribution.bestMeals
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
    const prettifiedCombinations = optimalCombinations.teams.slice(0, 100).map((team) => ({
      team: this.#prettifyTeamMembers(team),
      details:
        `${optimalCombinations.meal}: ${prettifiedRecipe}\nTeam: ${this.#prettifyTeamMembers(
          team
        )}\n\n${this.#prettifyDetails(optimalCombinations.filter)}\n\nTOTAL PRODUCED INGREDIENTS\n${
          team.prettyCombinedProduce
        }\n\nINDIVIDUAL PRODUCE\n${team.member1.pokemonCombination.pokemon.name}: ${prettifyIngredientDrop(
          team.member1.detailedProduce.produce.ingredients
        )}` +
        (team.member2
          ? `\n${team.member2!.pokemonCombination.pokemon.name}: ${prettifyIngredientDrop(
              team.member2!.detailedProduce.produce.ingredients
            )}`
          : '') +
        (team.member3
          ? `\n${team.member3!.pokemonCombination.pokemon.name}: ${prettifyIngredientDrop(
              team.member3!.detailedProduce.produce.ingredients
            )}`
          : '') +
        (team.member4
          ? `\n${team.member4!.pokemonCombination.pokemon.name}: ${prettifyIngredientDrop(
              team.member4!.detailedProduce.produce.ingredients
            )}`
          : '') +
        (team.member5
          ? `\n${team.member5!.pokemonCombination.pokemon.name}: ${prettifyIngredientDrop(
              team.member5!.detailedProduce.produce.ingredients
            )}`
          : ''),
    }));
    return {
      meal: optimalCombinations.meal,
      info:
        optimalCombinations.teams.length > 0
          ? `Requires ${
              [
                optimalCombinations.teams[0].member1,
                optimalCombinations.teams[0].member2,
                optimalCombinations.teams[0].member3,
                optimalCombinations.teams[0].member4,
                optimalCombinations.teams[0].member5,
              ].filter((member) => member !== undefined).length
            } Pokémon for 100% coverage, showing ${prettifiedCombinations.length} of ${
              optimalCombinations.teams.length
            } solutions`
          : 'No possible team combinations for 100% coverage found, cant be made with current filter',
      recipe: prettifiedRecipe,
      bonus: optimalCombinations.bonus,
      value: optimalCombinations.value,
      teams: prettifiedCombinations,
    };
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
    let prettyString = `👨🏻‍🍳${pokemonCombination.pokemonCombination.pokemon.name}(${shortPrettifyIngredientDrop(
      pokemonCombination.pokemonCombination.ingredientList
    )})👨🏻‍🍳\n`;

    prettyString += `-------------\n`;

    prettyString += `Level: ${pokemonCombination.customStats.level}\n`;
    prettyString += `Nature: ${pokemonCombination.customStats.nature.prettyName}\n`;
    prettyString += `Subskills: ${
      pokemonCombination.customStats.subskills.length > 0
        ? pokemonCombination.customStats.subskills.map((s) => s.name).join(', ')
        : 'None'
    }\n`;
    prettyString += `E4E: ${filters.e4eProcs}\n`;
    prettyString += `Helping Bonus: ${filters.helpingBonus}\n`;
    prettyString += `Good camp: ${filters.goodCamp}\n`;

    prettyString += `-------------\n`;
    const maybeSpilledIngredients =
      pokemonCombination.detailedProduce.spilledIngredients.length > 0
        ? prettifyIngredientDrop(pokemonCombination.detailedProduce.spilledIngredients)
        : 'None';
    prettyString += `Spilled ingredients at night\n${maybeSpilledIngredients}\n`;

    prettyString += `Total berry output per 24h\n${roundDown(
      pokemonCombination.detailedProduce.produce.berries.amount + pokemonCombination.detailedProduce.sneakySnack.amount,
      1
    )} ${pokemonCombination.pokemonCombination.pokemon.berry.name}\n\n`;

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

  #prettifyTeamMembers(team: OptimalTeamType) {
    return (
      `${team.member1.pokemonCombination.pokemon.name}(${shortPrettifyIngredientDrop(
        team.member1.pokemonCombination.ingredientList
      )})` +
      (team.member2
        ? `, ${team.member2!.pokemonCombination.pokemon.name}(${shortPrettifyIngredientDrop(
            team.member2!.pokemonCombination.ingredientList
          )})`
        : '') +
      (team.member3
        ? `, ${team.member3!.pokemonCombination.pokemon.name}(${shortPrettifyIngredientDrop(
            team.member3!.pokemonCombination.ingredientList
          )})`
        : '') +
      (team.member4
        ? `, ${team.member4!.pokemonCombination.pokemon.name}(${shortPrettifyIngredientDrop(
            team.member4!.pokemonCombination.ingredientList
          )})`
        : '') +
      (team.member5
        ? `, ${team.member5!.pokemonCombination.pokemon.name}(${shortPrettifyIngredientDrop(
            team.member5!.pokemonCombination.ingredientList
          )})`
        : '')
    );
  }

  #prettifyDetails(details: ProductionFilter) {
    let prettyString = 'FILTER\n';

    prettyString += `Level: ${details.level}\n`;
    prettyString += `Nature: ${details.nature.prettyName}\n`;
    prettyString += `Subskills: ${details.subskills.map((s) => s.name).join(', ')}\n`;
    prettyString += `E4E: ${details.e4eProcs}\n`;
    prettyString += `Helping Bonus: ${details.helpingBonus}\n`;
    prettyString += `Good camp: ${details.goodCamp}\n`;
    prettyString += `-------------`;

    return prettyString;
  }
}

export const WebsiteConverterService = new WebsiteConverterServiceImpl();
