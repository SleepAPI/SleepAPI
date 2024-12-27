import type { CustomPokemonCombinationWithProduce, CustomStats } from '@src/domain/combination/custom.js';
import type { CombinedContribution, Contribution } from '@src/domain/computed/contribution.js';
import type { IngredientSet, PokemonIngredientSet } from 'sleepapi-common';

export interface OptimalTeamSolution {
  team: CustomPokemonCombinationWithProduce[];
  surplus: SurplusIngredients;
  exhaustive: boolean;
}

export interface SurplusIngredients {
  total: IngredientSet[];
  relevant: IngredientSet[];
  extra: IngredientSet[];
}

export interface PokemonCombinationContributions {
  pokemonCombination: PokemonIngredientSet;
  contributions: Contribution[];
  stats: CustomStats;
}

export interface PokemonCombinationCombinedContribution {
  pokemonCombination: PokemonIngredientSet;
  combinedContribution: CombinedContribution;
}

export interface PokemonIngredientSetContribution {
  pokemonIngredientSet: PokemonIngredientSet;
  contributions: Contribution[];
}
