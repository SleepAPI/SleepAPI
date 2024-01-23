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
  unlockables: boolean;
}
export type MealType = 'curry' | 'salad' | 'dessert';

export const MEALS: Meal[] = [...CURRIES, ...SALADS, ...DESSERTS];
