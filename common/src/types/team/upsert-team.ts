import type { BerrySetSimple } from '../berry';
import type { IngredientSetSimple } from '../ingredient';
import type { TeamAreaDTO } from '../island';
import type { RecipeType } from '../recipe/recipe';
import type { MealPlan } from './meal-plan';

export interface UpsertTeamMetaRequest {
  name: string;
  camp: boolean;
  bedtime: string;
  wakeup: string;
  recipeType: RecipeType;
  mealPlan?: MealPlan;
  island: TeamAreaDTO;
  stockpiledIngredients?: IngredientSetSimple[];
  stockpiledBerries?: BerrySetSimple[];
}

export interface UpsertTeamMetaResponse {
  version: number;
}
