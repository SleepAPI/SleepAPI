import { TeamMember } from '../../domain/team/member';
import { SolveSettings, TeamSolution } from '../../domain/team/team';

export interface SolveRecipeRequest {
  settings: SolveSettings;
  includedMembers?: TeamMember[];
  maxTeamSize?: number;
}

export interface SolveRecipeResponse {
  teams: TeamSolution[];
  exhaustive: boolean;
}
