import { CustomPokemonCombinationWithProduce, CustomStats } from '@src/domain/combination/custom';
import { InputProductionStats } from '@src/domain/computed/production';
import { ProgrammingError } from '@src/domain/error/programming/programming-error';
import { MemoizedFilters, SetCover } from '@src/services/set-cover/set-cover';
import { subskillsForFilter } from '@src/utils/subskill-utils/subskill-utils';
import { IngredientSet, pokemon } from 'sleepapi-common';
import {
  calculateProducePerMealWindow,
  getAllIngredientCombinationsForLevel,
} from '../ingredient/ingredient-calculate';

export function calculateOptimalProductionForSetCover(productionStats: InputProductionStats) {
  const { level, nature, subskills, berries, goodCamp, e4eProcs, helpingBonus } = productionStats;
  const pokemonProduction: CustomPokemonCombinationWithProduce[] = [];

  const pokemonWithCorrectBerries = pokemon.OPTIMAL_POKEDEX.filter((pokemon) => berries.includes(pokemon.berry));
  for (const pokemon of pokemonWithCorrectBerries) {
    const subskillsForPokemon = subskills ?? subskillsForFilter('optimal', level, pokemon);
    for (const ingredientList of getAllIngredientCombinationsForLevel(pokemon, level)) {
      const customStats: CustomStats = {
        level,
        nature,
        subskills: subskillsForPokemon,
      };
      const detailedProduce = calculateProducePerMealWindow({
        pokemonCombination: {
          pokemon: pokemon,
          ingredientList,
        },
        customStats,
        e4eProcs,
        goodCamp,
        helpingBonus,
        combineIngredients: true,
      });

      pokemonProduction.push({
        pokemonCombination: {
          pokemon,
          ingredientList,
        },
        detailedProduce,
        customStats,
      });
    }
  }

  return pokemonProduction;
}

export function calculateSetCover(params: {
  recipe: IngredientSet[];
  memoizedFilters: MemoizedFilters;
  cache: Map<string, CustomPokemonCombinationWithProduce[][]>;
  reverseIndex: Map<string, CustomPokemonCombinationWithProduce[]>;
  maxTeamSize?: number;
  timeout?: number;
}) {
  const { recipe, memoizedFilters, cache, reverseIndex, maxTeamSize, timeout } = params;

  const firstPokemon = memoizedFilters.pokemon.at(0);
  if (!firstPokemon) {
    throw new ProgrammingError("Can't calculate Optimal Set without Pokémon");
  }

  const setCover = new SetCover(reverseIndex, memoizedFilters, cache);
  return setCover.findOptimalCombinationFor(recipe, maxTeamSize, timeout);
}
