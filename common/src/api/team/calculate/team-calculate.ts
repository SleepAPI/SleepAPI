import type { Recipe } from '../../../domain/recipe/recipe';
import type { BerrySet } from '../../../domain/types/berry-set';
import type { IngredientSet } from '../../../domain/types/ingredient-set';
import type { PokemonInstance } from '../../pokemon/pokemon-instance';
import type { Produce } from '../../production';

export interface TeamSettings {
  camp: boolean;
  bedtime: string;
  wakeup: string;
}

export interface PokemonInstanceIdentity extends PokemonInstance {
  externalId: string;
}

export interface CalculateTeamRequest {
  settings: TeamSettings;
  members: PokemonInstanceIdentity[];
}

export interface CalculateIvRequest {
  settings: TeamSettings;
  members: PokemonInstanceIdentity[];
  variants: PokemonInstanceIdentity[];
}

export interface MemberProductionAdvanced {
  ingredientPercentage: number;
  skillPercentage: number;
  carrySize: number;
  spilledIngredients: IngredientSet[];
  totalHelps: number;
  dayHelps: number;
  nightHelps: number;
  nightHelpsBeforeSS: number;
  nightHelpsAfterSS: number;
  sneakySnack: BerrySet;
  skillCrits: number;
  skillCritValue: number;
  wastedEnergy: number;
  morningProcs: number;
  totalRecovery: number;
}

export interface MemberProductionBase {
  produceTotal: Produce;
  skillProcs: number;
  externalId: string;
}

export interface MemberProduction extends MemberProductionBase {
  produceFromSkill: Produce;
  produceWithoutSkill: Produce;
  skillAmount: number;
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

export interface CalculateIvResponse {
  variants: MemberProductionBase[];
}
