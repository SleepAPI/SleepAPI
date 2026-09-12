import type { IngredientSet } from '../../types/ingredient/ingredient';
import type { TeamMemberDto } from '../../types/team/member';
import type { SolveSettingsDto, TeamSolution } from '../../types/team/team';

export interface SolveRecipeRequest {
  settings: SolveSettingsDto;
  includedMembers?: TeamMemberDto[];
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
