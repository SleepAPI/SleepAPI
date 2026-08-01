import type { IngredientProducersWithSettings } from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import type { IngredientIndexToIntAmount, SolveSettings, TeamMember } from 'sleepapi-common';

export interface SolveRecipeInput {
  includedMembers: TeamMember[];
  solveSettings: SolveSettings;
  maxTeamSize: number;
}

export interface SubRecipeMeta {
  remainingRecipeWithSpotsLeft: IngredientIndexToIntAmount;
  remainingIngredientIndices: number[];
  sumRemainingRecipeIngredients: number;
  member: number;
}

// an array of solutions containing an array of each member's index in producer array
export type RecipeSolutions = Array<Array<number>>;

export interface SolveRecipeSolution {
  members: IngredientProducersWithSettings;
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
