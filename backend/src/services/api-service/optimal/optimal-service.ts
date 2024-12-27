import type { SetCoverProductionStats } from '@src/domain/computed/production.js';
import {
  calculateOptimalProductionForSetCover,
  calculateSetCover
} from '@src/services/calculator/set-cover/calculate-set-cover.js';
import { getMeal } from '@src/utils/meal-utils/meal-utils.js';
import { createPokemonByIngredientReverseIndex } from '@src/utils/set-cover-utils/set-cover-utils.js';
import { getIngredient } from 'sleepapi-common';

export const FLEXIBLE_BEST_RECIPE_PER_TYPE_MULTIPLIER = 1.2;
const TEAMFINDER_SET_COVER_TIMEOUT = 10000;

/**
 * Runs the optimal set algorithm for a specific recipe
 *
 * API: /api/optimal/meal
 */
export function findOptimalSetsForMeal(mealName: string, input: SetCoverProductionStats, monteCarloIterations: number) {
  return customOptimalSet(mealName, input, TEAMFINDER_SET_COVER_TIMEOUT, monteCarloIterations);
}

/**
 * Finds the optimal Pokemon for a specific ingredient
 *
 * API: /api/optimal/ingredient
 */
export function findOptimalMonsForIngredient(
  ingredientName: string,
  input: SetCoverProductionStats,
  monteCarloIterations: number
) {
  const ingredient = getIngredient(ingredientName);
  const ingAsRecipe = [{ ingredient: ingredient, amount: 0.001 }];
  const pokemonProduction = calculateOptimalProductionForSetCover(input, monteCarloIterations);
  const reverseIndex = createPokemonByIngredientReverseIndex(pokemonProduction);

  const optimalCombinations = calculateSetCover({
    recipe: ingAsRecipe,
    cache: new Map(),
    reverseIndex,
    maxTeamSize: 1,
    timeout: TEAMFINDER_SET_COVER_TIMEOUT
  });

  return {
    ingredient: ingredient.name,
    filter: input,
    teams: optimalCombinations
  };
}

function customOptimalSet(
  mealName: string,
  input: SetCoverProductionStats,
  timeout: number,
  monteCarloIterations: number
) {
  const meal = getMeal(mealName);

  const pokemonProduction = calculateOptimalProductionForSetCover(input, monteCarloIterations);

  const reverseIndex = createPokemonByIngredientReverseIndex(pokemonProduction);

  const optimalCombinations = calculateSetCover({
    recipe: meal.ingredients,
    reverseIndex,
    cache: new Map(),
    timeout
  });

  return {
    bonus: meal.bonus,
    meal: meal.name,
    recipe: meal.ingredients,
    value: meal.value,
    filter: input,
    teams: optimalCombinations
  };
}
