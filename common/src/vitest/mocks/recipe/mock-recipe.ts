import type { Recipe } from '../../../domain/recipe/recipe';
import { mockIngredientSet } from '../ingredient/mock-ingredient-set';

export function recipe(attrs?: Partial<Recipe>): Recipe {
  return {
    bonus: 0,
    name: 'Mock recipe',
    nrOfIngredients: 0,
    ingredients: [mockIngredientSet()],
    type: 'curry',
    value: 0,
    valueMax: 0,
    ...attrs
  };
}
