import { mockIngredient } from '@src/vitest/mocks/ingredient/mock-ingredient.js';
import { IngredientIndexToIntAmount, IngredientSet, ingredientSetToIntFlat } from 'sleepapi-common';

export function mockIngredientSet(attrs?: Partial<IngredientSet>): IngredientSet {
  return {
    amount: 0,
    ingredient: mockIngredient(),
    ...attrs
  };
}

export function mockIngredientSetIntIndexed(attrs?: Partial<IngredientSet>): IngredientIndexToIntAmount {
  return ingredientSetToIntFlat([mockIngredientSet(attrs)]);
}
