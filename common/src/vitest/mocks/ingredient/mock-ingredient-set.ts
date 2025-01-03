import type {
  IngredientIndexToFloatAmount,
  IngredientIndexToIntAmount,
  IngredientSet
} from '../../../domain/ingredient/ingredient';
import { ingredientSetToFloatFlat, ingredientSetToIntFlat } from '../../../utils/ingredient-utils/ingredient-utils';
import { mockIngredient } from './mock-ingredient';

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

export function mockIngredientSetFloatIndexed(attrs?: Partial<IngredientSet>): IngredientIndexToFloatAmount {
  return ingredientSetToFloatFlat([mockIngredientSet(attrs)]);
}
