import { IngredientDrop } from '../produce/ingredient';

// --- /meal/:name --- //
export interface CombinationForMealType {
  pokemon: string;
  percentage: string;
  contributedPower: string;
  ingredientList: IngredientDrop[];
  producedIngredients: IngredientDrop[];
}

// --- /pokemon/:name --- //
export interface AllCombinationsForMealType {
  meal: string;
  bonus: number;
  value: number;
  recipe: IngredientDrop[];
  combinations: CombinationForMealType[];
}

// --- /ranking/meal/flexible --- //
export interface CombinationForFlexibleRankingType {
  pokemon: string;
  averagePercentage: number;
  ingredientList: IngredientDrop[];
}

// --- /ranking/meal/focused --- //
export interface CombinationForFocusedRankingType {
  pokemon: string;
  total: number;
  meals: string;
  ingredientList: IngredientDrop[];
}
