import type { IngredientSet } from '../types';

export interface Recipe {
  name: string;
  value: number;
  valueMax: number;
  type: RecipeType;
  ingredients: IngredientSet[];
  bonus: number;
  nrOfIngredients: number;
}
export type RecipeType = 'curry' | 'salad' | 'dessert';
