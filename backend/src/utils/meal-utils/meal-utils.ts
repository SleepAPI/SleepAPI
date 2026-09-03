import { MealError } from '@src/domain/error/meal/meal-error.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { MealSlot, MealTimes, Recipe, Time, TimePeriod } from 'sleepapi-common';
import { parseTime, RECIPES } from 'sleepapi-common';

export function getMeal(name: string) {
  const meal: Recipe | undefined = RECIPES.find((meal) => meal.name === name.toUpperCase());
  if (!meal) {
    throw new MealError("Couldn't find meal with name: " + name.toUpperCase());
  }
  return meal;
}

export function getMealsForFilter(params: {
  curry?: boolean;
  salad?: boolean;
  dessert?: boolean;
  minRecipeBonus?: number;
  maxPotSize?: number;
}) {
  const { curry = false, salad = false, dessert = false, minRecipeBonus = 0, maxPotSize } = params;
  let recipes = RECIPES;

  if (curry || salad || dessert) {
    recipes = recipes.filter(
      (meal) =>
        (meal.type === 'curry' && curry) || (meal.type === 'salad' && salad) || (meal.type === 'dessert' && dessert)
    );
  }
  const recipesWithBonus = recipes.filter((m) => m.bonus >= minRecipeBonus);

  return maxPotSize ? recipesWithBonus.filter((m) => m.nrOfIngredients <= maxPotSize) : recipesWithBonus;
}

export function getDefaultMealTimes(dayPeriod: TimePeriod): { meals: MealTimes; sorted: Time[] } {
  const windows = getMealWindows(dayPeriod);
  const meals: MealTimes = {};
  for (const window of windows) {
    meals[window.meal] = window.end;
  }

  return {
    meals,
    sorted: windows.map((window) => window.end)
  };
}

export interface MealWindow {
  meal: MealSlot;
  start: Time;
  end: Time;
}

export function getMealWindows(dayPeriod: TimePeriod): MealWindow[] {
  const breakfastWindow: TimePeriod = {
    start: parseTime('04:00'),
    end: parseTime('12:00')
  };
  const lunchWindow: TimePeriod = {
    start: parseTime('12:00'),
    end: parseTime('18:00')
  };
  const dinnerWindow: TimePeriod = {
    start: parseTime('18:00'),
    end: parseTime('04:00')
  };

  return [
    { meal: 'breakfast' as const, period: breakfastWindow },
    { meal: 'lunch' as const, period: lunchWindow },
    { meal: 'dinner' as const, period: dinnerWindow }
  ]
    .flatMap(({ meal, period }) => {
      const start = TimeUtils.getEarliestMinuteInOverlap(period, dayPeriod);
      const end = TimeUtils.getLatestMinuteInOverlap(period, dayPeriod);
      return start && end ? [{ meal, start, end }] : [];
    })
    .sort((a, b) => TimeUtils.sortTimesForPeriod(a.start, b.start, dayPeriod));
}

export function getMealRecoveryAmount(currentEnergy: number) {
  if (currentEnergy >= 81) {
    return 1;
  } else if (currentEnergy >= 71) {
    return 2;
  } else if (currentEnergy >= 61) {
    return 3;
  } else if (currentEnergy >= 51) {
    return 4;
  } else if (currentEnergy >= 41) {
    return 5;
  } else if (currentEnergy >= 31) {
    return 6;
  } else if (currentEnergy >= 21) {
    return 7;
  } else if (currentEnergy >= 11) {
    return 8;
  } else {
    return 9;
  }
}
