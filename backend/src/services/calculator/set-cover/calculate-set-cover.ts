import { CustomPokemonCombinationWithProduce, CustomStats } from '../../../domain/combination/custom';
import { InputProductionStats } from '../../../domain/computed/production';
import { ProgrammingError } from '../../../domain/error/programming/programming-error';
import { OPTIMAL_POKEDEX } from '../../../domain/pokemon/pokemon';
import { IngredientDrop } from '../../../domain/produce/ingredient';

import { MemoizedFilters, SetCover } from '../../set-cover/set-cover';
import {
  calculateProducePerMealWindow,
  getAllIngredientCombinationsForLevel,
} from '../ingredient/ingredient-calculate';

export function calculateOptimalProductionForSetCover(productionStats: InputProductionStats) {
  const { level, nature, subskills, berries, goodCamp, e4eProcs, helpingBonus } = productionStats;
  const pokemonProduction: CustomPokemonCombinationWithProduce[] = [];

  const pokemonWithCorrectBerries = OPTIMAL_POKEDEX.filter((pokemon) => berries.includes(pokemon.berry));
  for (const pokemon of pokemonWithCorrectBerries) {
    for (const ingredientList of getAllIngredientCombinationsForLevel(pokemon, level)) {
      const customStats: CustomStats = {
        level,
        nature,
        subskills,
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
  recipe: IngredientDrop[];
  memoizedFilters: MemoizedFilters;
  memoizedParams: Map<string, CustomPokemonCombinationWithProduce[][]>;
  reverseIndex: Map<string, CustomPokemonCombinationWithProduce[]>;
  solutionLimit?: number;
}) {
  const { recipe, memoizedFilters, memoizedParams, reverseIndex, solutionLimit } = params;

  const firstPokemon = memoizedFilters.pokemon.at(0);
  if (!firstPokemon) {
    throw new ProgrammingError("Can't calculate Optimal Set without Pokémon");
  }

  const setCover = new SetCover(reverseIndex, memoizedFilters, memoizedParams, solutionLimit);
  return setCover.findOptimalCombinationFor(recipe);
}
