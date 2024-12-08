import { CookingResult, RecipeTypeResult } from 'sleepapi-common';

export function mockCookingResult(attrs?: Partial<CookingResult>): CookingResult {
  return {
    curry: mockRecipeTypeResult(),
    salad: mockRecipeTypeResult(),
    dessert: mockRecipeTypeResult(),
    critInfo: {
      averageCritChancePerCook: 0,
      averageCritMultiplierPerCook: 0
    },
    ...attrs
  };
}

export function mockRecipeTypeResult(attrs?: Partial<RecipeTypeResult>): RecipeTypeResult {
  return {
    cookedRecipes: [],
    sundayStrength: 0,
    weeklyStrength: 0,
    ...attrs
  };
}
