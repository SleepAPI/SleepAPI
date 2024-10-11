import { PokemonInstance } from '../../../api/pokemon/pokemon-instance';
import { Recipe } from '../../../domain/recipe/recipe';
import { BerrySet } from '../../../domain/types/berry-drop';
import { IngredientSet } from '../../../domain/types/ingredient-set';

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
}

export interface MemberProduction {
  berries?: BerrySet;
  ingredients: IngredientSet[];
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
