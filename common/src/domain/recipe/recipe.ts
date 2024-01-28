import { IngredientSet } from '../types';
import { CURRIES } from './curry';
import { DESSERTS } from './dessert';
import { SALADS } from './salad';

export interface Recipe {
  name: string;
  value: number;
  value50: number;
  type: RecipeType;
  ingredients: IngredientSet[];
  bonus: number;
  nrOfIngredients: number;
}
export type RecipeType = 'curry' | 'salad' | 'dessert';

export const MAX_POT_SIZE = 57;

export const RECIPES: Recipe[] = [...CURRIES, ...SALADS, ...DESSERTS];
