import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { Time, TimePeriod } from '@src/domain/time/time';
import {
  MEALS_IN_DAY,
  RECIPES,
  Recipe,
  SUNDAY_CRIT_CHANCE,
  SUNDAY_CRIT_MULTIPLIER,
  TASTY_CHANCE_S_CAP,
  WEEKDAY_CRIT_CHANCE,
  WEEKDAY_CRIT_MULTIPLIER,
  mainskill,
} from 'sleepapi-common';
import { MealError } from '../../domain/error/meal/meal-error';
import { roundDown } from '../calculator-utils/calculator-utils';
import { rollRandomChance } from '../simulation-utils/simulation-utils';
import { isAfterOrEqualWithinPeriod, parseTime, sortTimesForPeriod, timeWithinPeriod } from '../time-utils/time-utils';

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

export interface CritInfo {
  critMultiplier: number;
  weekdayMultiplier: number;
  sundayMultiplier: number;
  fullWeekCritChance: number;
  weekdayCritChance: number;
  sundayCritChance: number;
}
export function calculateCritMultiplier(skillActivations: SkillActivation[], cache: Map<number, CritInfo>) {
  const bonusChance =
    skillActivations.reduce(
      (sum, cur) => (cur.skill === mainskill.TASTY_CHANCE_S ? sum + cur.adjustedAmount / 100 : 0),
      0
    ) / MEALS_IN_DAY;

  const key = roundDown(bonusChance, 2);
  const cachedResult = cache.get(key);
  if (cachedResult) {
    return cachedResult;
  }

  const averageFullWeekMultipliers: number[] = [];
  const averageWeekdayMultipliers: number[] = [];
  const averageSundayMultipliers: number[] = [];
  const averageFullWeekCritChances: number[] = [];
  const averageWeekdayCritChances: number[] = [];
  const averageSundayCritChances: number[] = [];

  for (let i = 0; i < 5000; i++) {
    const {
      fullWeekMultiplier,
      weekdayMultiplier,
      sundayMultiplier,
      fullWeekCritChance,
      weekdayCritChance,
      sundayCritChance,
    } = monteCarloCrits(bonusChance);
    averageFullWeekMultipliers.push(fullWeekMultiplier);
    averageWeekdayMultipliers.push(weekdayMultiplier);
    averageSundayMultipliers.push(sundayMultiplier);

    averageFullWeekCritChances.push(fullWeekCritChance);
    averageWeekdayCritChances.push(weekdayCritChance);
    averageSundayCritChances.push(sundayCritChance);
  }

  const critMultiplier =
    averageFullWeekMultipliers.reduce((sum, cur) => sum + cur, 0) / averageFullWeekMultipliers.length;
  const weekdayMultiplier =
    averageWeekdayMultipliers.reduce((sum, cur) => sum + cur, 0) / averageWeekdayMultipliers.length;
  const sundayMultiplier =
    averageSundayMultipliers.reduce((sum, cur) => sum + cur, 0) / averageSundayMultipliers.length;
  const fullWeekCritChance =
    averageFullWeekCritChances.reduce((sum, cur) => sum + cur, 0) / averageFullWeekCritChances.length;
  const weekdayCritChance =
    averageWeekdayCritChances.reduce((sum, cur) => sum + cur, 0) / averageWeekdayCritChances.length;
  const sundayCritChance =
    averageSundayCritChances.reduce((sum, cur) => sum + cur, 0) / averageSundayCritChances.length;

  const result: CritInfo = {
    critMultiplier,
    weekdayMultiplier,
    sundayMultiplier,
    fullWeekCritChance,
    weekdayCritChance,
    sundayCritChance,
  };

  cache.set(key, result);
  return result;
}

export function monteCarloCrits(bonusChance: number) {
  const weekdayMultipliers: number[] = [];
  const sundayMultipliers: number[] = [];
  let weekdayCrits = 0;
  let sundayCrits = 0;
  let currentBonus = bonusChance;

  const WEEKDAY_MEALS = 18;
  for (let i = 0; i < WEEKDAY_MEALS; i++) {
    const critRoll = rollRandomChance(WEEKDAY_CRIT_CHANCE + currentBonus);
    if (critRoll) {
      weekdayMultipliers.push(WEEKDAY_CRIT_MULTIPLIER);
      currentBonus = bonusChance;
      weekdayCrits += 1;
    } else {
      weekdayMultipliers.push(1);
      currentBonus = Math.min(currentBonus + bonusChance, TASTY_CHANCE_S_CAP + WEEKDAY_CRIT_CHANCE);
    }
  }

  const SUNDAY_MEALS = 3;
  for (let i = 0; i < SUNDAY_MEALS; i++) {
    const critRoll = rollRandomChance(SUNDAY_CRIT_CHANCE + currentBonus);
    if (critRoll) {
      sundayMultipliers.push(SUNDAY_CRIT_MULTIPLIER);
      currentBonus = bonusChance;
      sundayCrits += 1;
    } else {
      sundayMultipliers.push(1);
      currentBonus = Math.min(currentBonus + bonusChance, TASTY_CHANCE_S_CAP + SUNDAY_CRIT_CHANCE);
    }
  }

  const weekdayMultiplier = weekdayMultipliers.reduce((sum, cur) => sum + cur) / weekdayMultipliers.length;
  const sundayMultiplier = sundayMultipliers.reduce((sum, cur) => sum + cur) / sundayMultipliers.length;
  const fullWeekMultiplier =
    (weekdayMultipliers.reduce((sum, cur) => sum + cur) + sundayMultipliers.reduce((sum, cur) => sum + cur)) /
    (weekdayMultipliers.length + sundayMultipliers.length);
  const fullWeekCritChance = 100 * ((weekdayCrits + sundayCrits) / (WEEKDAY_MEALS + SUNDAY_MEALS));
  const weekdayCritChance = 100 * (weekdayCrits / WEEKDAY_MEALS);
  const sundayCritChance = 100 * (sundayCrits / SUNDAY_MEALS);

  return {
    fullWeekMultiplier,
    weekdayMultiplier,
    sundayMultiplier,
    fullWeekCritChance,
    weekdayCritChance,
    sundayCritChance,
  };
}
