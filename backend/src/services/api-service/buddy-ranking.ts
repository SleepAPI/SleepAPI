import { BuddyCombinationForMealDAO } from '../../database/dao/buddy/buddy-combination-for-meal-dao';
import { BuddyCombinationForMeal30DAO } from '../../database/dao/buddy/buddy-combination-for-meal30-dao';
import { getBerriesForFilter, getBerryNames } from '../../utils/berry-utils/berry-utils';
import { getMealNamesForFilter } from './meal-ranking';

export async function getBuddyFlexibleRanking(params: {
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
  nrOfMeals?: number;
  page?: number;
}) {
  const { page = 1, limit30 } = params;
  const meals = getMealNamesForFilter(params);
  const allowedBerries = getBerryNames(getBerriesForFilter(params));

  const pokemonCombinations = limit30
    ? await BuddyCombinationForMeal30DAO.getBuddyFlexibleRanking({
        meals,
        allowedBerries,
        page,
      })
    : await BuddyCombinationForMealDAO.getBuddyFlexibleRanking({
        meals,
        allowedBerries,
        page,
      });

  return pokemonCombinations;
}

export async function getBuddyRankingFor(params: {
  name: string;
  limit30: boolean;
  cyan: boolean;
  taupe: boolean;
  snowdrop: boolean;
  nrOfMeals?: number;
  page?: number;
}) {
  const { page = 1, limit30, name: mealName } = params;
  const allowedBerries = getBerryNames(getBerriesForFilter(params));

  const pokemonCombinations = limit30
    ? await BuddyCombinationForMeal30DAO.getBuddyCombinationsForMeal({
        mealName,
        allowedBerries,
        page,
      })
    : await BuddyCombinationForMealDAO.getBuddyCombinationsForMeal({
        mealName,
        allowedBerries,
        page,
      });

  return pokemonCombinations;
}
