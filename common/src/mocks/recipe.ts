import { MOOMOO_MILK } from '../domain/ingredient';
import { Recipe } from '../domain/recipe';

export const MOCK_RECIPE: Recipe = {
  name: 'mock recipe',
  nrOfIngredients: 0,
  type: 'dessert',
  value: 0,
  valueMax: 0,
  bonus: 0,
  ingredients: [{ amount: 12, ingredient: MOOMOO_MILK }],
};
