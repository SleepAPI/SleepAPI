import { CombinedContribution, Contribution } from '../computed/contribution';
import { Pokemon } from '../pokemon/pokemon';
import { IngredientDrop } from '../produce/ingredient';
import { CustomPokemonCombinationWithProduce } from './custom';

export type PokemonCombination = {
  pokemon: Pokemon;
  ingredientList: IngredientDrop[];
};

export interface OptimalTeamSolution {
  team: CustomPokemonCombinationWithProduce[];
  sumSurplus: number;
  prettySurplus: string;
  prettyCombinedProduce: string;
}

// --- contribution --- //
export interface PokemonCombinationContributions {
  pokemonCombination: PokemonCombination;
  contributions: Contribution[];
}

export interface PokemonCombinationCombinedContribution {
  pokemonCombination: PokemonCombination;
  combinedContribution: CombinedContribution;
}
