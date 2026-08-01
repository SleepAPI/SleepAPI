import type { Ingredient } from '../ingredient/ingredient';

export interface IngredientInstanceDto {
  level: number;
  amount: number;
  name: string;
}

export interface IngredientInstance {
  level: number;
  amount: number;
  ingredient: Ingredient;
}
