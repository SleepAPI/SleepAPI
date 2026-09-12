import type { IngredientIndexToFloatAmount, IngredientSet, IngredientSetSimple } from '../ingredient/ingredient';
import type { IslandInstance, IslandInstanceDto } from '../island';
import type { Time } from '../time/time';
import type { TeamMemberWithProduce } from './member';
import type { CalculateTeamResponse } from './team-calculate';

export interface TeamSettingsDto {
  camp: boolean;
  bedtime: string;
  wakeup: string;
  island: IslandInstanceDto;
  stockpiledIngredients?: IngredientSetSimple[];
}
export interface TeamSettings {
  camp: boolean;
  bedtime: Time;
  wakeup: Time;
  includeCooking: boolean;
  stockpiledIngredients: IngredientIndexToFloatAmount;
  potSize: number;
  island: IslandInstance;
}

export interface TeamSolution {
  members: TeamMemberWithProduce[];
  producedIngredients: IngredientSet[];
}

export type TeamResults = CalculateTeamResponse;

export interface SolveSettingsDto extends TeamSettingsDto {
  level: number;
}
export interface SolveSettings extends TeamSettings {
  level: number;
}
