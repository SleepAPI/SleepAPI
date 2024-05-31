import { IngredientSet } from '../../domain/types';

export function AddOneIngredient(baseDrop: IngredientSet): IngredientSet {
  return {
    amount: baseDrop.amount + 1,
    ingredient: baseDrop.ingredient,
  };
}
