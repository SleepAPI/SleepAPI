import { MealError } from '@src/domain/error/meal/meal-error.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { Recipe, Time, TimePeriod } from 'sleepapi-common';
import { RECIPES } from 'sleepapi-common';

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

export function getDefaultMealTimes(dayPeriod: TimePeriod): Time[] {
  const breakfastWindow: TimePeriod = {
    start: TimeUtils.parseTime('04:00'),
    end: TimeUtils.parseTime('11:59')
  };
  const lunchWindow: TimePeriod = {
    start: TimeUtils.parseTime('12:00'),
    end: TimeUtils.parseTime('17:59')
  };
  const dinnerWindow: TimePeriod = {
    start: TimeUtils.parseTime('18:00'),
    end: TimeUtils.parseTime('03:59')
  };

  const mealTimes: Time[] = [];

  if (
    TimeUtils.timeWithinPeriod(breakfastWindow.start, dayPeriod) ||
    TimeUtils.timeWithinPeriod(breakfastWindow.end, dayPeriod)
  ) {
    const beforeWindowEndOrBedtime = TimeUtils.isAfterOrEqualWithinPeriod({
      currentTime: dayPeriod.end,
      eventTime: breakfastWindow.end,
      period: dayPeriod
    })
      ? breakfastWindow.end
      : dayPeriod.end;

    mealTimes.push(beforeWindowEndOrBedtime);
  }

  if (
    TimeUtils.timeWithinPeriod(lunchWindow.start, dayPeriod) ||
    TimeUtils.timeWithinPeriod(lunchWindow.end, dayPeriod)
  ) {
    const beforeWindowEndOrBedtime = TimeUtils.isAfterOrEqualWithinPeriod({
      currentTime: dayPeriod.end,
      eventTime: lunchWindow.end,
      period: dayPeriod
    })
      ? lunchWindow.end
      : dayPeriod.end;

    mealTimes.push(beforeWindowEndOrBedtime);
  }

  if (
    TimeUtils.timeWithinPeriod(dinnerWindow.start, dayPeriod) ||
    TimeUtils.timeWithinPeriod(dinnerWindow.end, dayPeriod)
  ) {
    const beforeWindowEndOrBedtime = TimeUtils.isAfterOrEqualWithinPeriod({
      currentTime: dayPeriod.end,
      eventTime: dinnerWindow.end,
      period: dayPeriod
    })
      ? dinnerWindow.end
      : dayPeriod.end;

    mealTimes.push(beforeWindowEndOrBedtime);
  }

  return mealTimes.sort((a, b) => TimeUtils.sortTimesForPeriod(a, b, dayPeriod));
}

export function getMealRecoveryAmount(currentEnergy: number) {
  if (currentEnergy >= 150) {
    return 0;
  } else if (currentEnergy >= 80) {
    return 1;
  } else if (currentEnergy >= 60) {
    return 2;
  } else if (currentEnergy >= 40) {
    return 3;
  } else if (currentEnergy >= 20) {
    return 4;
  } else {
    return 5;
  }
}
