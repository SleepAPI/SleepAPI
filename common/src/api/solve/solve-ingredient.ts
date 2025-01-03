import type { TeamMemberWithProduce } from '../../domain/team/member';
import type { SolveSettings } from '../../domain/team/team';

export interface SolveIngredientRequest {
  settings: SolveSettings;
}

export interface SolveIngredientResponse {
  members: TeamMemberWithProduce[];
}
