import type { IngredientIndexToFloatAmount, IngredientSet, IngredientSetSimple } from '../ingredient/ingredient';
import type { IslandInstance, IslandInstanceDto } from '../island';
import type { RecipeType } from '../recipe/recipe';
import type { Time } from '../time/time';
import type { TeamMemberWithProduce } from './member';
import type { CalculateTeamResponse } from './team-calculate';
import type { MealPlan } from './meal-plan';

export interface TeamSettings {
  camp: boolean;
  bedtime: string;
  wakeup: string;
  island: IslandInstanceDto;
  stockpiledIngredients?: IngredientSetSimple[];
  recipeType?: RecipeType;
  mealPlan?: MealPlan;
}
export interface TeamSettingsExt {
  camp: boolean;
  bedtime: Time;
  wakeup: Time;
  includeCooking: boolean;
  stockpiledIngredients: IngredientIndexToFloatAmount;
  potSize: number;
  island: IslandInstance;
  recipeType?: RecipeType;
  mealPlan?: MealPlan;
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
