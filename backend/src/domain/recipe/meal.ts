import { IngredientDrop } from '../produce/ingredient';
import { CURRIES } from './curry';
import { DESSERTS } from './dessert';
import { SALADS } from './salad';

export interface Meal {
  name: string;
  value: number;
  value50: number;
  type: MealType;
  ingredients: IngredientDrop[];
  bonus: number;
  nrOfIngredients: number;
}
export type MealType = 'curry' | 'salad' | 'dessert';

export const MAX_POT_SIZE = 57;

export const MEALS: Meal[] = [...CURRIES, ...SALADS, ...DESSERTS];
