import type { IngredientSet } from '../ingredient/ingredient';

export interface Recipe {
  name: string;
  ingredients: IngredientSet[];
  value: number;
  valueMax: number;
  type: RecipeType;
  bonus: number;
  nrOfIngredients: number;
}

export interface RecipeFlat {
  name: string;
  ingredients: Float32Array;
  value: number;
  valueMax: number;
  type: RecipeType;
  bonus: number;
  nrOfIngredients: number;
}

export type RecipeType = 'curry' | 'salad' | 'dessert';
