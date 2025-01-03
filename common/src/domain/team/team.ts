import type { CalculateTeamResponse } from '../../api/team/calculate/team-calculate';
import type { IngredientSet } from '../ingredient/ingredient';
import type { Time } from '../types/time';
import type { TeamMemberWithProduce } from './member';

export interface TeamSettings {
  camp: boolean;
  bedtime: string;
  wakeup: string;
}
export interface TeamSettingsExt {
  camp: boolean;
  bedtime: Time;
  wakeup: Time;
}

export interface TeamSolution {
  members: TeamMemberWithProduce[];
  producedIngredients: IngredientSet[];
}

export type TeamResults = CalculateTeamResponse;

export interface SolveSettings extends TeamSettings {
  level: number;
}
export interface SolveSettingsExt extends TeamSettingsExt {
  level: number;
}
