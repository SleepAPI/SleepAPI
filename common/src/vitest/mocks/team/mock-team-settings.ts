import { defaultMealPlan } from '../../../types/team/meal-plan';
import type { TeamSettings, TeamSettingsExt } from '../../../types/team/team';
import { mockIngredientSetFloatIndexed } from '../ingredient/mock-ingredient-set';
import { islandInstance } from '../island';
import { bedtime, wakeup } from '../time';

export function teamSettings(attrs?: Partial<TeamSettings>): TeamSettings {
  return {
    camp: false,
    bedtime: '21:30',
    wakeup: '06:00',
    stockpiledIngredients: [],
    recipeType: 'curry',
    mealPlan: defaultMealPlan(),
    island: islandInstance(),
    ...attrs
  };
}

export function teamSettingsExt(attrs?: Partial<TeamSettingsExt>): TeamSettingsExt {
  return {
    bedtime: bedtime(),
    wakeup: wakeup(),
    camp: false,
    includeCooking: false,
    stockpiledIngredients: mockIngredientSetFloatIndexed(),
    potSize: 15,
    island: islandInstance(),
    recipeType: 'curry',
    mealPlan: defaultMealPlan(),
    ...attrs
  };
}
