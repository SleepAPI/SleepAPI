import type { Pokemon } from '../pokemon';
import type { IngredientSet } from './ingredient-set';

export type PokemonIngredientSet = {
  pokemon: Pokemon;
  ingredientList: IngredientSet[];
};
