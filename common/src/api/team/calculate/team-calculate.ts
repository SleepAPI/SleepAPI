import { Recipe } from '../../../domain/recipe/recipe';
import { IngredientSet } from '../../../domain/types/ingredient-set';
import { PokemonInstance } from '../../pokemon/pokemon-instance';
import { Produce } from '../../production';

export interface TeamSettings {
  camp: boolean;
  bedtime: string;
  wakeup: string;
}

export interface PokemonInstanceIdentity extends PokemonInstance {
  externalId?: string;
}

export interface CalculateTeamRequest {
  settings: TeamSettings;
  members: PokemonInstanceIdentity[];
}

export interface MemberProductionAdvanced {
  spilledIngredients: IngredientSet[];
  totalHelps: number;
  dayHelps: number;
  nightHelps: number;
  nightHelpsBeforeSS: number;
  nightHelpsAfterSS: number;
  skillCrits: number;
  skillCritValue: number;
  wastedEnergy: number;
  morningProcs: number;
}

export interface MemberProduction {
  produceTotal: Produce;
  produceFromSkill: Produce;
  produceWithoutSkill: Produce;
  skillProcs: number;
  skillAmount: number;
  externalId?: string;
  advanced: MemberProductionAdvanced;
}

export interface CookedRecipeResult {
  recipe: Recipe;
  count: number;
  sunday: number;
  totalSkipped: number;
  potLimited: { count: number; averageMissing: number };
  ingredientLimited: { ingredientName: string; count: number; averageMissing: number }[];
}

export interface RecipeTypeResult {
  weeklyStrength: number;
  sundayStrength: number;
  cookedRecipes: CookedRecipeResult[];
}

export interface CookingResult {
  curry: RecipeTypeResult;
  salad: RecipeTypeResult;
  dessert: RecipeTypeResult;
}

export interface CalculateTeamResponse {
  members: MemberProduction[];
  cooking: CookingResult;
}
