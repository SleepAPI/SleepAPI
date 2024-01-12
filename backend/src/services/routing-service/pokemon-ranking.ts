import { PokemonCombinationForMealDAO } from '../../database/dao/pokemon-combination-for-meal-dao';
import { PokemonCombinationForMeal30DAO } from '../../database/dao/pokemon-combination-for-meal30-dao';
import { getMealNamesForFilter } from './meal-ranking';

export async function getPokemonCombinationData(params: {
  name: string;
  limit30: boolean;
  advanced: boolean;
  unlocked: boolean;
  lategame: boolean;
  curry: boolean;
  salad: boolean;
  dessert: boolean;
}) {
  const { name, limit30 } = params;
  const mealNames = getMealNamesForFilter(params);

  const pokemonCombinations = limit30
    ? await PokemonCombinationForMeal30DAO.getCombinationDataForPokemon(name, mealNames)
    : await PokemonCombinationForMealDAO.getCombinationDataForPokemon(name, mealNames);

  return pokemonCombinations.sort((a, b) => b.averagePercentage - a.averagePercentage);
}
