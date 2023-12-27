import { Pokemon } from '../pokemon/pokemon';
import { IngredientDrop } from '../produce/ingredient';
import { CustomPokemonCombinationWithProduce } from './custom';

export type PokemonCombination = {
  pokemon: Pokemon;
  ingredientList: IngredientDrop[];
};

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

// --- /optimal/:name --- //
export interface DetailedOptimalCombination {
  team: CustomPokemonCombinationWithProduce[];
  sumSurplus: number;
  prettySurplus: string;
  prettyCombinedProduce: string;
}
