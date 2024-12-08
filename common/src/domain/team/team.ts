import { CalculateTeamResponse } from '../../api/team/calculate/team-calculate';
import { IngredientSet } from '../ingredient/ingredient';
import { Time } from '../types/time';
import { TeamMemberWithProduce } from './member';

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
