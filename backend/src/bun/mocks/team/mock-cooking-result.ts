import type { CookingResult, RecipeTypeResult } from 'sleepapi-common';

export function cookingResult(attrs?: Partial<CookingResult>): CookingResult {
  return {
    curry: recipeTypeResult(),
    salad: recipeTypeResult(),
    dessert: recipeTypeResult(),
    critInfo: {
      averageCritChancePerCook: 0,
      averageCritMultiplierPerCook: 0,
      averageWeekdayPotSize: 0
    },
    ...attrs
  };
}

export function recipeTypeResult(attrs?: Partial<RecipeTypeResult>): RecipeTypeResult {
  return {
    cookedRecipes: [],
    sundayStrength: 0,
    weeklyStrength: 0,
    ...attrs
  };
}
