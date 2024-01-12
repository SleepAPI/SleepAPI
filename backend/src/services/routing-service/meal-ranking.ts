import { PokemonCombinationForMealDAO } from '../../database/dao/pokemon-combination-for-meal-dao';
import { PokemonCombinationForMeal30DAO } from '../../database/dao/pokemon-combination-for-meal30-dao';
import { Island } from '../../domain/island/island';
import { getBerriesForFilter, getBerriesForIsland, getBerryNames } from '../../utils/berry-utils/berry-utils';
import { getMealsForFilter } from '../../utils/meal-utils/meal-utils';

export function getMealNamesForFilter(params: {
  advanced: boolean;
  unlocked: boolean;
  lategame: boolean;
  curry: boolean;
  salad: boolean;
  dessert: boolean;
}) {
  const meals = getMealsForFilter(params);
  return meals.map((meal) => meal.name);
}

export async function getMealDataAndRankingFor(params: { name: string; limit30: boolean; island?: Island }) {
  const { name, limit30, island } = params;
  const allowedBerries = getBerryNames(getBerriesForIsland(island));

  const pokemonCombinations = limit30
    ? await PokemonCombinationForMeal30DAO.getPokemonCombinationsForMeal(name, allowedBerries)
    : await PokemonCombinationForMealDAO.getPokemonCombinationsForMeal(name, allowedBerries);

  return pokemonCombinations;
}

/**
 * Ranks all Pokemon according to filters sorted by average meal percentage covered
 * Used by /ranking/meal/flexible
 * @param params
 * @returns
 */
export async function getMealGeneralistRanking(params: {
  limit30: boolean;
  advanced: boolean;
  unlocked: boolean;
  lategame: boolean;
  curry: boolean;
  salad: boolean;
  dessert: boolean;
  cyan: boolean;
  taupe: boolean;
  snowdrop: boolean;
  lapis: boolean;
}) {
  const meals = getMealNamesForFilter(params);
  const allowedBerries = getBerryNames(getBerriesForFilter(params));

  return params.limit30
    ? await PokemonCombinationForMeal30DAO.getFlexibleRankingForMeals(meals, allowedBerries)
    : await PokemonCombinationForMealDAO.getFlexibleRankingForMeals(meals, allowedBerries);
}

/**
 * Ranks all Pokemon according to filters sorted by average meal percentage covered
 * Used by /ranking/meal/focused
 * @param params
 * @returns
 */
export async function getMealFocusedRanking(params: {
  limit30: boolean;
  advanced: boolean;
  unlocked: boolean;
  lategame: boolean;
  curry: boolean;
  salad: boolean;
  dessert: boolean;
  cyan: boolean;
  taupe: boolean;
  snowdrop: boolean;
  lapis: boolean;
  nrOfMeals?: number;
}) {
  const { nrOfMeals = 3 } = params;
  const meals = getMealNamesForFilter(params);
  const allowedBerries = getBerryNames(getBerriesForFilter(params));

  return params.limit30
    ? await PokemonCombinationForMeal30DAO.getFocusedRankingForMeals(meals, allowedBerries, nrOfMeals)
    : await PokemonCombinationForMealDAO.getFocusedRankingForMeals(meals, allowedBerries, nrOfMeals);
}
