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
export type IngredientIndexToIntAmount = Int16Array; // TODO: maybe we go with uint8 instead? at least should be uint16
export type IngredientIndexToFloatAmount = Float32Array;
