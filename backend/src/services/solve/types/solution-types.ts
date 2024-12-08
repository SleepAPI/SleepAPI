import {
  IngredientProducers,
  IngredientProducersWithSettings,
  SetCoverPokemonSetup
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import { IngredientIndexToIntAmount } from 'sleepapi-common';

export interface SubRecipeMeta {
  remainingRecipeWithSpotsLeft: IngredientIndexToIntAmount;
  remainingIngredientIndices: number[];
  sumRemainingRecipeIngredients: number;
  member: SetCoverPokemonSetup;
}

export type RecipeSolutions = IngredientProducers[];
export interface SolveRecipeSolution {
  members: IngredientProducers;
  producedIngredients: IngredientIndexToIntAmount;
}
export interface SolveRecipeSolutionWithSettings {
  members: IngredientProducersWithSettings;
  producedIngredients: IngredientIndexToIntAmount;
}
