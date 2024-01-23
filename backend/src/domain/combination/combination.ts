import { CombinedContribution, Contribution } from '../computed/contribution';
import { Pokemon } from '../pokemon/pokemon';
import { IngredientDrop } from '../produce/ingredient';
import { CustomPokemonCombinationWithProduce, CustomStats } from './custom';

export type PokemonCombination = {
  pokemon: Pokemon;
  ingredientList: IngredientDrop[];
};

export interface OptimalTeamSolution {
  team: CustomPokemonCombinationWithProduce[];
  surplus: SurplusIngredients;
}

export interface SurplusIngredients {
  total: IngredientDrop[];
  relevant: IngredientDrop[];
  extra: IngredientDrop[];
}

export interface PokemonCombinationContributions {
  pokemonCombination: PokemonCombination;
  contributions: Contribution[];
  stats: CustomStats;
}

export interface PokemonCombinationCombinedContribution {
  pokemonCombination: PokemonCombination;
  combinedContribution: CombinedContribution;
}
