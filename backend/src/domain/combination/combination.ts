import { IngredientSet, PokemonIngredientSet } from 'sleepapi-common';
import { CombinedContribution, Contribution } from '../computed/contribution';
import { CustomPokemonCombinationWithProduce, CustomStats } from './custom';

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
