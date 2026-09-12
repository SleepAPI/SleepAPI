import type {
  BerrySet,
  IngredientIndexToFloatAmount,
  IngredientSet,
  MainskillUnit,
  MealTimes,
  PokemonInstanceDto,
  PokemonWithIngredientsIndexed,
  TeamMember,
  TeamSettingsDto
} from '..';
import type { Produce } from '../production';
import type { Recipe } from '../recipe/recipe';

export interface PokemonInstanceIdentity extends PokemonInstanceDto {
  externalId: string;
}

export interface CalculateTeamRequest {
  settings: TeamSettingsDto;
  members: PokemonInstanceIdentity[];
}

export interface CalculateIvRequest {
  settings: TeamSettingsDto;
  members: PokemonInstanceIdentity[];
  variants: PokemonInstanceIdentity[];
}

export interface PeriodInfo {
  averageFrequency: number;
  averageEnergy: number;
  spilledIngredients: IngredientSet[];
}

export interface MemberProductionAdvanced {
  ingredientPercentage: number;
  skillPercentage: number;
  carrySize: number;
  maxFrequency: number;
  totalHelps: number;
  averageHelps: number;
  dayHelps: number;
  nightHelps: number;
  nightHelpsBeforeSS: number;
  nightHelpsAfterSS: number;
  sneakySnack: BerrySet;
  skillCrits: number;
  skillRegularValue: number;
  skillCritValue: number;
  wastedEnergy: number;
  morningProcs: number;
  totalRecovery: number;
  skillProcDistribution: Record<number, number>;
  berryProductionDistribution: Record<number, number>;
  ingredientDistributions: { [ingredientName: string]: Record<number, number> };
  dayPeriod: PeriodInfo;
  nightPeriod: PeriodInfo;
  frequencySplit: {
    zero: number;
    one: number;
    forty: number;
    sixty: number;
    eighty: number;
  };
  teamSupport: {
    energy: number;
    helps: number;
  };
}

export interface MemberProductionBase {
  produceTotal: Produce;
  skillProcs: number;
  externalId: string;
  pokemonWithIngredients: PokemonWithIngredientsIndexed;
}

export type MemberSkillValue = Record<MainskillUnit, { amountToSelf: number; amountToTeam: number }>;

export interface MemberStrength {
  berries: {
    total: number;
    breakdown: {
      base: number;
      favored: number;
      islandBonus: number;
      event?: number;
    };
  };
  skill: {
    total: number;
    breakdown: {
      base: number;
      islandBonus: number;
      event?: number;
    };
  };
}

export interface MemberProduction extends MemberProductionBase {
  produceFromSkill: Produce;
  produceWithoutSkill: Produce;
  /**
   * @deprecated Use `skillValue` instead
   */
  skillAmount: number;
  skillValue: MemberSkillValue;
  skillLevel: number; // effective skill level after bonuses and capped at max
  advanced: MemberProductionAdvanced;
  strength: MemberStrength;
}

export interface CookedRecipeResult {
  recipe: Recipe;
  level: number;
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
  // TODO: rename critInfo
  critInfo: {
    averageCritMultiplierPerCook: number;
    averageCritChancePerCook: number;
    averageWeekdayPotSize: number;
  };
  mealTimes: MealTimes;
}

// TODO: refactor to split by production, strength etc instead of members
export interface CalculateTeamResponse {
  members: MemberProduction[];
  cooking?: CookingResult;
}

export interface CalculateIvResponse {
  variants: MemberProductionBase[];
}

export interface SimpleTeamResult {
  skillProcs: number;
  totalHelps: number;
  skillIngredients: IngredientIndexToFloatAmount;
  critMultiplier: number;
  averageWeekdayPotSize: number;
  ingredientPercentage: number;
  member: TeamMember;
}
