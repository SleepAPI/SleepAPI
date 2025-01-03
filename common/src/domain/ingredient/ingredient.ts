export interface Ingredient {
  name: string;
  value: number;
  taxedValue: number;
  longName: string;
}
export interface IngredientSet {
  amount: number;
  ingredient: Ingredient;
}
export type IngredientIndexToIntAmount = Int16Array;
export type IngredientIndexToFloatAmount = Float32Array;
