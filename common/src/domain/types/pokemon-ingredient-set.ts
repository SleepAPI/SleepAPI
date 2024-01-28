import { Pokemon } from '../pokemon';
import { IngredientSet } from './ingredient-set';

export type PokemonIngredientSet = {
  pokemon: Pokemon;
  ingredientList: IngredientSet[];
};
