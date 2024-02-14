import { PokemonCombinationContributions } from '../../../domain/combination/combination';
import { CustomPokemonCombinationWithProduce } from '../../../domain/combination/custom';
import { Contribution } from '../../../domain/computed/contribution';
import { InputProductionStats, TeamWithProduce, TeamsForMeal } from '../../../domain/computed/production';
import { OptimalFlexibleResult } from '../../../routes/optimal-router/optimal-router';
import { calculateContributionForMealWithPunishment } from '../../../services/calculator/contribution/contribution-calculator';
import { getMeal, getMealsForFilter } from '../../../utils/meal-utils/meal-utils';
import {
  calculateCombinedContributions,
  removeDuplicatePokemonCombinations,
} from '../../../utils/optimal-utils/optimal-utils';
import { createPokemonByIngredientReverseIndex } from '../../../utils/set-cover-utils/set-cover-utils';
import {
  calculateOptimalProductionForSetCover,
  calculateSetCover,
} from '../../calculator/set-cover/calculate-set-cover';

export const FLEXIBLE_BEST_RECIPE_PER_TYPE_MULTIPLIER = 1.2;
const TEAMFINDER_SET_COVER_TIMEOUT = 10000;
const FLEXIBLE_SET_COVER_TIMEOUT = 3000;

/**
 * Runs the optimal set algorithm for a specific recipe
 *
 * API: /api/optimal/meal
 */
export function findOptimalSetsForMeal(mealName: string, input: InputProductionStats) {
  return customOptimalSet(mealName, input, TEAMFINDER_SET_COVER_TIMEOUT);
}

/**
 * Scores all pokemon found in optimal team solutions in terms of flexibility
 *
 * API: /api/optimal/meal/flexible
 */
export function getOptimalFlexiblePokemon(input: InputProductionStats): OptimalFlexibleResult[] {
  const flexiblePokemonCombinations: TeamsForMeal[] = generateOptimalTeamSolutions(input);

  const pokemonOccurenceInOptimalSolutions: Map<string, Contribution[]> = new Map();
  for (const { meal, teams } of flexiblePokemonCombinations) {
    const uniqueOptimalPokemonCombinationsForMeal: CustomPokemonCombinationWithProduce[] =
      removeDuplicatePokemonCombinations(teams.flat());

    // update map
    for (const pokemonWithProduce of uniqueOptimalPokemonCombinationsForMeal) {
      const contribution: Contribution = calculateContributionForMealWithPunishment({
        meal,
        teamSize: teams[0].length,
        percentage: 100,
        producedIngredients: pokemonWithProduce.detailedProduce.produce.ingredients,
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
function generateOptimalTeamSolutions(input: InputProductionStats) {
  const pokemonProduction = calculateOptimalProductionForSetCover(input);
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

function customOptimalSet(mealName: string, inputStats: InputProductionStats, timeout: number) {
  const meal = getMeal(mealName);

  const pokemonProduction = calculateOptimalProductionForSetCover(inputStats);

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
