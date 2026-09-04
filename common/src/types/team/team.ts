import type { IngredientIndexToFloatAmount, IngredientSet, IngredientSetSimple } from '../ingredient/ingredient';
import type { IslandInstance, IslandInstanceDto } from '../island';
import type { Time } from '../time/time';
import type { TeamMemberWithProduce } from './member';
import type { CalculateTeamResponse } from './team-calculate';

export type TeamScheduleType = 'time' | 'tasty-chance' | 'pot-size';

/**
 * A recurring entry for one of the five visible team slots. Entries are
 * intentionally flat so existing persisted time schedules remain valid.
 */
export interface TeamScheduleShift {
  slotIndex: number;
  externalId: string;
  startTime: string;
  /** Missing on legacy schedules and therefore interpreted as `time`. */
  type?: TeamScheduleType;
  tastyChanceTarget?: number;
  potSizeTarget?: number;
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
