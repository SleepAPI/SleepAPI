import type { BerrySetSimple } from '../berry';
import type { IngredientSetSimple } from '../ingredient';
import type { TeamAreaDTO } from '../island';
import type { RecipeType } from '../recipe/recipe';
import type { MemberInstance } from './member-instance';
import type { MealPlan } from './meal-plan';

export interface GetTeamResponse {
  index: number;
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  recipeType: RecipeType;
  mealPlan?: MealPlan;
  island: TeamAreaDTO;
  stockpiledBerries?: BerrySetSimple[];
  stockpiledIngredients?: IngredientSetSimple[];
  version: number;

  members: MemberInstance[];
}

export interface GetTeamsResponse {
  teams: GetTeamResponse[];
}
