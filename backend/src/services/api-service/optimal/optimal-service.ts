import { PokemonCombinationContributions } from '@src/domain/combination/combination';
import { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom';
import { Contribution } from '@src/domain/computed/contribution';
import { InputProductionStats, TeamsForMeal, TeamWithProduce } from '@src/domain/computed/production';
import { OptimalFlexibleResult } from '@src/routes/optimal-router/optimal-router';
import { calculateContributionForMealWithPunishment } from '@src/services/calculator/contribution/contribution-calculator';
import {
  calculateOptimalProductionForSetCover,
  calculateSetCover,
} from '@src/services/calculator/set-cover/calculate-set-cover';
import { calculateCritMultiplier, CritInfo, getMeal, getMealsForFilter } from '@src/utils/meal-utils/meal-utils';
import {
  calculateCombinedContributions,
  removeDuplicatePokemonCombinations,
} from '@src/utils/optimal-utils/optimal-utils';
import { createPokemonByIngredientReverseIndex } from '@src/utils/set-cover-utils/set-cover-utils';

export const FLEXIBLE_BEST_RECIPE_PER_TYPE_MULTIPLIER = 1.2;
const TEAMFINDER_SET_COVER_TIMEOUT = 10000;
const FLEXIBLE_SET_COVER_TIMEOUT = 3000;

/**
 * Runs the optimal set algorithm for a specific recipe
 *
 * API: /api/optimal/meal
 */
export function findOptimalSetsForMeal(mealName: string, input: InputProductionStats, monteCarloIterations: number) {
  return customOptimalSet(mealName, input, TEAMFINDER_SET_COVER_TIMEOUT, monteCarloIterations);
}

/**
 * Scores all pokemon found in optimal team solutions in terms of flexibility
 *
 * API: /api/optimal/meal/flexible
 */
export function getOptimalFlexiblePokemon(
  input: InputProductionStats,
  monteCarloIterations: number
): OptimalFlexibleResult[] {
  const flexiblePokemonCombinations: TeamsForMeal[] = generateOptimalTeamSolutions(input, monteCarloIterations);

  const pokemonOccurenceInOptimalSolutions: Map<string, Contribution[]> = new Map();
  const cache: Map<number, CritInfo> = new Map();
  for (const { meal, teams } of flexiblePokemonCombinations) {
    const uniqueOptimalPokemonCombinationsForMeal: CustomPokemonCombinationWithProduce[] =
      removeDuplicatePokemonCombinations(teams.flat());

    for (const pokemonWithProduce of uniqueOptimalPokemonCombinationsForMeal) {
      const { critMultiplier } = calculateCritMultiplier(pokemonWithProduce.detailedProduce.skillActivations, cache);
      const contribution: Contribution = calculateContributionForMealWithPunishment({
        meal,
        teamSize: teams[0].length,
        percentage: 100,
        producedIngredients: pokemonWithProduce.detailedProduce.produce.ingredients,
        critMultiplier,
      });

      const key = JSON.stringify(pokemonWithProduce);

      if (!pokemonOccurenceInOptimalSolutions.has(key)) {
        pokemonOccurenceInOptimalSolutions.set(key, [contribution]);
      } else {
        const pokemonCombinationToUpdate = pokemonOccurenceInOptimalSolutions.get(key);
        if (pokemonCombinationToUpdate) {
          pokemonOccurenceInOptimalSolutions.set(key, pokemonCombinationToUpdate.concat(contribution));
        }
      }
    }
  }

  // convert to array
  const sortedOptimalFlexiblePokemon: PokemonCombinationContributions[] = Array.from(
    pokemonOccurenceInOptimalSolutions
  ).map((pokemonCombinationWithContribution) => {
    const pokemonWithProduce = JSON.parse(pokemonCombinationWithContribution[0]) as CustomPokemonCombinationWithProduce;
    return {
      pokemonCombination: pokemonWithProduce.pokemonCombination,
      contributions: pokemonCombinationWithContribution[1],
      stats: pokemonWithProduce.customStats,
    };
  });

  const pokemonCombinationsWithScore = calculateCombinedContributions(sortedOptimalFlexiblePokemon);

  const sorted = pokemonCombinationsWithScore.sort((a, b) => b.scoreResult.score - a.scoreResult.score);
  return sorted.map(({ pokemonCombination, scoreResult, stats }) => ({
    pokemonCombination,
    scoreResult,
    input: {
      ...input,
      subskills: stats.subskills,
    },
  }));
}

/**
 * Finds all optimal team solutions for all recipes for given input production stats
 */
function generateOptimalTeamSolutions(input: InputProductionStats, monteCarloIterations: number) {
  const pokemonProduction = calculateOptimalProductionForSetCover(input, monteCarloIterations);
  const reverseIndex = createPokemonByIngredientReverseIndex(pokemonProduction);

  const cache = new Map();

  const optimalTeamSolutions: TeamsForMeal[] = [];
  const mealsForFilter = getMealsForFilter({ maxPotSize: input.maxPotSize });
  for (const meal of mealsForFilter) {
    const teamCompositionsForMeal = calculateSetCover({
      recipe: meal.ingredients,
      reverseIndex,
      cache,
      timeout: FLEXIBLE_SET_COVER_TIMEOUT,
    });

    const allTeams: TeamWithProduce[] = teamCompositionsForMeal.map((solution) => solution.team);

    optimalTeamSolutions.push({ meal, teams: allTeams });
  }

  return optimalTeamSolutions;
}

function customOptimalSet(
  mealName: string,
  inputStats: InputProductionStats,
  timeout: number,
  monteCarloIterations: number
) {
  const meal = getMeal(mealName);

  const pokemonProduction = calculateOptimalProductionForSetCover(inputStats, monteCarloIterations);

  const reverseIndex = createPokemonByIngredientReverseIndex(pokemonProduction);

  const optimalCombinations = calculateSetCover({
    recipe: meal.ingredients,
    reverseIndex,
    cache: new Map(),
    timeout,
  });

  return {
    bonus: meal.bonus,
    meal: meal.name,
    recipe: meal.ingredients,
    value: meal.value,
    filter: inputStats,
    teams: optimalCombinations,
  };
}
