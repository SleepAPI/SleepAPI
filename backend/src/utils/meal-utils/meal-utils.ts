import { Time, TimePeriod } from '@src/domain/time/time';
import { recipe } from 'sleepapi-common';
import { MealError } from '../../domain/error/meal/meal-error';
import { isAfterOrEqualWithinPeriod, parseTime, sortTimesForPeriod, timeWithinPeriod } from '../time-utils/time-utils';

export function getMeal(name: string) {
  const meal: recipe.Recipe | undefined = recipe.RECIPES.find((meal) => meal.name === name.toUpperCase());
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
  let recipes = recipe.RECIPES;

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
    start: parseTime('06:00'),
    end: parseTime('11:59'),
  };
  const lunchWindow: TimePeriod = {
    start: parseTime('12:00'),
    end: parseTime('17:59'),
  };
  const dinnerWindow: TimePeriod = {
    start: parseTime('18:00'),
    end: parseTime('05:59'),
  };

  const mealTimes: Time[] = [];

  if (timeWithinPeriod(breakfastWindow.start, dayPeriod) || timeWithinPeriod(breakfastWindow.end, dayPeriod)) {
    const beforeWindowEndOrBedtime = isAfterOrEqualWithinPeriod({
      currentTime: dayPeriod.end,
      eventTime: breakfastWindow.end,
      period: dayPeriod,
    })
      ? breakfastWindow.end
      : dayPeriod.end;

    mealTimes.push(beforeWindowEndOrBedtime);
  }

  if (timeWithinPeriod(lunchWindow.start, dayPeriod) || timeWithinPeriod(lunchWindow.end, dayPeriod)) {
    const beforeWindowEndOrBedtime = isAfterOrEqualWithinPeriod({
      currentTime: dayPeriod.end,
      eventTime: lunchWindow.end,
      period: dayPeriod,
    })
      ? lunchWindow.end
      : dayPeriod.end;

    mealTimes.push(beforeWindowEndOrBedtime);
  }

  if (timeWithinPeriod(dinnerWindow.start, dayPeriod) || timeWithinPeriod(dinnerWindow.end, dayPeriod)) {
    const beforeWindowEndOrBedtime = isAfterOrEqualWithinPeriod({
      currentTime: dayPeriod.end,
      eventTime: dinnerWindow.end,
      period: dayPeriod,
    })
      ? dinnerWindow.end
      : dayPeriod.end;

    mealTimes.push(beforeWindowEndOrBedtime);
  }

  return mealTimes.sort((a, b) => sortTimesForPeriod(a, b, dayPeriod));
}

export function getMealRecoveryAmount(currentEnergy: number) {
  if (currentEnergy >= 100) {
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
