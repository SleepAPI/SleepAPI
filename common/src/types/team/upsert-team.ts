import type { BerrySetSimple } from '../berry';
import type { IngredientSetSimple } from '../ingredient';
import type { TeamAreaDTO } from '../island';
import type { RecipeType } from '../recipe/recipe';
import type { UpsertTeamMemberRequest } from './upsert-member';
import type { TeamScheduleShift } from './team';

export interface UpsertTeamMetaRequest {
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  recipeType: RecipeType;
  island: TeamAreaDTO;
  stockpiledIngredients?: IngredientSetSimple[];
  stockpiledBerries?: BerrySetSimple[];
  schedule?: TeamScheduleShift[];
  scheduledMembers?: UpsertTeamMemberRequest[];
}

export interface UpsertTeamMetaResponse {
  version: number;
}
