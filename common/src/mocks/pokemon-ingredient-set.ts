import { PokemonIngredientSet } from '../domain/types';
import { MOCK_INGREDIENT_SET } from './ingredient-set';
import { MOCK_POKEMON } from './pokemon';

export const MOCK_POKEMON_INGREDIENT_SET: PokemonIngredientSet = {
  pokemon: MOCK_POKEMON,
  ingredientList: [MOCK_INGREDIENT_SET, MOCK_INGREDIENT_SET, MOCK_INGREDIENT_SET],
};
