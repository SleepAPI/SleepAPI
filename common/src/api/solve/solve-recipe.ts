import { TeamMember } from '../../domain/team/member';
import { SolveSettings, TeamSolution } from '../../domain/team/team';

// TODO: could support taking an array of allowed pokemon, instead of island filters etc, more custom
export interface SolveRecipeRequest {
  settings: SolveSettings;
  requiredMembers?: TeamMember[]; // TODO: undefined should default to empty array
  maxTeamSize?: number; // TODO: undefined should default to 5
}

export interface SolveRecipeResponse {
  teams: TeamSolution[];
  exhaustive: boolean;
}
