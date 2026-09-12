import type { TeamMemberWithProduce } from '../../types/team/member';
import type { SolveSettingsDto } from '../../types/team/team';

export interface SolveIngredientRequest {
  settings: SolveSettingsDto;
}

export interface SolveIngredientResponse {
  members: TeamMemberWithProduce[];
}
