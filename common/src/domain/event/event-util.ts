import { IngredientSet } from 'src/domain';

export function AddOneIngredient(baseDrop: IngredientSet): IngredientSet {
  return {
    amount: baseDrop.amount + 1,
    ingredient: baseDrop.ingredient,
  };
}
