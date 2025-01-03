import type { IngredientSet } from '../../domain/ingredient/ingredient';
import type { TeamMember } from '../../domain/team/member';
import type { SolveSettings, TeamSolution } from '../../domain/team/team';

export interface SolveRecipeRequest {
  settings: SolveSettings;
  includedMembers?: TeamMember[];
  maxTeamSize?: number;
}

export interface SurplusIngredients {
  total: IngredientSet[];
  relevant: IngredientSet[];
  extra: IngredientSet[];
}

export interface RecipeTeamSolution extends TeamSolution {
  surplus: SurplusIngredients;
}

export interface SolveRecipeResponse {
  teams: RecipeTeamSolution[];
  exhaustive: boolean;
}
