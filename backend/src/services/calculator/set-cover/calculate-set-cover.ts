import { CustomPokemonCombinationWithProduce, CustomStats } from '../../../domain/combination/custom';
import { POKEDEX } from '../../../domain/pokemon/pokemon';
import { Berry } from '../../../domain/produce/berry';
import { IngredientDrop } from '../../../domain/produce/ingredient';
import { Nature } from '../../../domain/stat/nature';
import { createPokemonByIngredientReverseIndex } from '../../set-cover/set-cover-utils';

import { SubSkill } from '../../../domain/stat/subskill';
import { SetCover } from '../../set-cover/set-cover';
import {
  calculateProducePerMealWindow,
  getAllIngredientCombinationsForLevel,
} from '../ingredient/ingredient-calculate';

export function calculateOptimalProductionForSetCover(params: {
  level: number;
  nature: Nature;
  subskills: SubSkill[];
  allowedBerries: Berry[];
  goodCamp: boolean;
  e4eProcs: number;
  helpingBonus: number;
}) {
  const { level, nature, subskills, allowedBerries, goodCamp, e4eProcs, helpingBonus } = params;
  const pokemonProduction: CustomPokemonCombinationWithProduce[] = [];

  const pokemonWithCorrectBerries = POKEDEX.filter((pokemon) => allowedBerries.includes(pokemon.berry));
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
  pokemonProduction: CustomPokemonCombinationWithProduce[];
  memoizedParams: Map<string, CustomPokemonCombinationWithProduce[][]>;
}) {
  const { recipe, pokemonProduction, memoizedParams } = params;

  const firstPokemon = pokemonProduction.at(0);
  if (!firstPokemon) {
    throw new Error("Can't calculate Optimal Set without Pokémon");
  }
  const limit50 = firstPokemon.pokemonCombination.ingredientList.length < 3;

  const setCover = new SetCover(
    createPokemonByIngredientReverseIndex(pokemonProduction),
    { limit50, pokemon: pokemonProduction.map((pkmn) => pkmn.pokemonCombination.pokemon.name) },
    memoizedParams
  );
  return setCover.findOptimalCombinationFor(recipe);
}
