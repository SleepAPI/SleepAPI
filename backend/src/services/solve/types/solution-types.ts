import type {
  IngredientProducers,
  IngredientProducersWithSettings,
  SetCoverPokemonSetup
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import type { IngredientIndexToIntAmount, SolveSettingsExt, TeamMemberExt } from 'sleepapi-common';

export interface SolveRecipeInput {
  includedMembers: TeamMemberExt[];
  solveSettings: SolveSettingsExt;
  maxTeamSize: number;
}

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

export interface SolveRecipeResult {
  teams: SolveRecipeSolution[];
  exhaustive: boolean;
}
export interface SolveRecipeResultWithSettings {
  teams: SolveRecipeSolutionWithSettings[];
  exhaustive: boolean;
}
