import { PokemonWithIngredients, Recipe } from 'sleepapi-common';

export interface Contribution {
  meal: Recipe;
  percentage: number;
  contributedPower: number;
  skillValue?: number;
  team?: PokemonWithIngredients[];
}

export interface CombinedContribution {
  contributions: Contribution[];
  averagePercentage: number;
  score: number;
}

export interface PokemonCombinationCombinedContribution {
  pokemonCombination: PokemonWithIngredients;
  combinedContribution: CombinedContribution;
}

export interface PokemonIngredientSetContribution {
  pokemonIngredientSet: PokemonWithIngredients;
  contributions: Contribution[];
}
