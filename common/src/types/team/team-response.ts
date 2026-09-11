import type { BerrySetSimple } from '../berry';
import type { IngredientSetSimple } from '../ingredient';
import type { TeamAreaDTO } from '../island';
import type { RecipeType } from '../recipe/recipe';
import type { PokemonInstanceWithMeta } from '../instance/pokemon-instance';
import type { MemberInstance } from './member-instance';
import type { TeamScheduleShift } from './team';

export interface GetTeamResponse {
  index: number;
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  recipeType: RecipeType;
  island: TeamAreaDTO;
  stockpiledBerries?: BerrySetSimple[];
  stockpiledIngredients?: IngredientSetSimple[];
  version: number;

  members: MemberInstance[];
  schedule?: TeamScheduleShift[];
  scheduledMembers?: PokemonInstanceWithMeta[];
}

export interface GetTeamsResponse {
  teams: GetTeamResponse[];
}
