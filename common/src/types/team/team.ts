import type { IngredientIndexToFloatAmount, IngredientSet, IngredientSetSimple } from '../ingredient/ingredient';
import type { IslandInstance, IslandInstanceDto } from '../island';
import type { Time } from '../time/time';
import type { TeamMemberWithProduce } from './member';
import type { CalculateTeamResponse } from './team-calculate';

/** A recurring shift for one of the five visible team slots. */
export interface TeamScheduleShift {
  slotIndex: number;
  externalId: string;
  startTime: string;
}

export interface TeamSettings {
  camp: boolean;
  bedtime: string;
  wakeup: string;
  island: IslandInstanceDto;
  stockpiledIngredients?: IngredientSetSimple[];
  schedule?: TeamScheduleShift[];
}
export interface TeamSettingsExt {
  camp: boolean;
  bedtime: Time;
  wakeup: Time;
  includeCooking: boolean;
  stockpiledIngredients: IngredientIndexToFloatAmount;
  potSize: number;
  island: IslandInstance;
  schedule?: TeamScheduleShift[];
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
