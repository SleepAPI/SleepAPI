import type { PokemonIngredientSet, Recipe } from 'sleepapi-common';

export interface Contribution {
  meal: Recipe;
  percentage: number;
  contributedPower: number;
  skillValue?: number;
  team?: PokemonIngredientSet[];
}

export interface CombinedContribution {
  contributions: Contribution[];
  averagePercentage: number;
  score: number;
}
