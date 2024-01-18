import { IngredientDrop } from '../produce/ingredient';
import { ADVANCED_CURRIES, ADVANCED_UNLOCKED_CURRIES, CURRIES, LATEGAME_CURRIES } from './curry';
import { ADVANCED_DESSERTS, ADVANCED_UNLOCKED_DESSERTS, DESSERTS, LATEGAME_DESSERTS } from './dessert';
import { ADVANCED_SALADS, ADVANCED_UNLOCKED_SALADS, LATEGAME_SALADS, SALADS } from './salad';

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

export const ADVANCED_MEALS: Meal[] = [...ADVANCED_CURRIES, ...ADVANCED_SALADS, ...ADVANCED_DESSERTS];
export const ADVANCED_UNLOCKED_MEALS: Meal[] = [
  ...ADVANCED_UNLOCKED_CURRIES,
  ...ADVANCED_UNLOCKED_SALADS,
  ...ADVANCED_UNLOCKED_DESSERTS,
];
export const LATEGAME_MEALS: Meal[] = [...LATEGAME_CURRIES, ...LATEGAME_SALADS, ...LATEGAME_DESSERTS];
