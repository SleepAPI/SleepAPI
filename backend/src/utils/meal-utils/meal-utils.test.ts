import { MealError } from '@src/domain/error/meal/meal-error';
import { SkillActivation } from '@src/domain/event/events/skill-event/skill-event';
import { RECIPES, curry, dessert, mainskill, salad } from 'sleepapi-common';
import { roundDown } from '../calculator-utils/calculator-utils';
import { MOCKED_MAIN_SLEEP } from '../test-utils/defaults';
import { parseTime, prettifyTime } from '../time-utils/time-utils';
import {
  CritInfo,
  calculateCritMultiplier,
  getDefaultMealTimes,
  getMeal,
  getMealRecoveryAmount,
  getMealsForFilter,
} from './meal-utils';

describe('getMeal', () => {
  it('shall return Lovely Kiss for lovely_kIsS_smOOthie name', () => {
    expect(getMeal('lovely_kIsS_smOOthie')).toBe(dessert.LOVELY_KISS_SMOOTHIE);
  });

  it("shall throw if Meal can't be found", () => {
    expect(() => getMeal('missing')).toThrow(MealError);
  });
});

describe('getMealsForFilter', () => {
  it('should return curry meals when curry is true', () => {
    expect(
      getMealsForFilter({
        curry: true,
        salad: false,
        dessert: false,
      })
    ).toEqual(curry.CURRIES);
  });

  it('should return salad meals when salad is true', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: true,
        dessert: false,
      })
    ).toEqual(salad.SALADS);
  });

  it('should return dessert meals when dessert is true', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: true,
      })
    ).toEqual(dessert.DESSERTS);
  });

  it('should return all meals when no specific filters are applied', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: false,
      })
    ).toEqual(RECIPES);
  });

  it('shall return all meals above 35% bonus', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: false,
        minRecipeBonus: 35,
      }).map((m) => m.name)
    ).toMatchInlineSnapshot(`
      [
        "DREAM_EATER_BUTTER_CURRY",
        "INFERNO_CORN_KEEMA_CURRY",
        "CALM_MIND_FRUIT_SALAD",
        "NINJA_SALAD",
        "GREENGRASS_SALAD",
        "EXPLOSION_POPCORN",
        "JIGGLYPUFFS_FRUITY_FLAN",
        "TEATIME_CORN_SCONES",
        "FLOWER_GIFT_MACARONS",
      ]
    `);
  });

  it('shall return all meals below pot limit 57', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: false,
        maxPotSize: 57,
      }).map((m) => m.name)
    ).toMatchInlineSnapshot(`
      [
        "FANCY_APPLE_CURRY",
        "SIMPLE_CHOWDER",
        "MILD_HONEY_CURRY",
        "BEANBURGER_CURRY",
        "HEARTY_CHEESEBURGER_CURRY",
        "DROUGHT_KATSU_CURRY",
        "SOLAR_POWER_TOMATO_CURRY",
        "MELTY_OMELETTE_CURRY",
        "SOFT_POTATO_CHOWDER",
        "BULK_UP_BEAN_CURRY",
        "SPORE_MUSHROOM_CURRY",
        "EGG_BOMB_CURRY",
        "LIMBER_CORN_STEW",
        "SPICY_LEEK_CURRY",
        "NINJA_CURRY",
        "GRILLED_TAIL_CURRY",
        "DREAM_EATER_BUTTER_CURRY",
        "FANCY_APPLE_SALAD",
        "BEAN_HAM_SALAD",
        "SNOOZY_TOMATO_SALAD",
        "SNOW_CLOAK_CAESAR_SALAD",
        "WATER_VEIL_TOFU_SALAD",
        "HEAT_WAVE_TOFU_SALAD",
        "FURY_ATTACK_CORN_SALAD",
        "DAZZLING_APPLE_CHEESE_SALAD",
        "MOOMOO_CAPRESE_SALAD",
        "IMMUNITY_LEEK_SALAD",
        "SUPERPOWER_EXTREME_SALAD",
        "CONTRARY_CHOCOLATE_MEAT_SALAD",
        "GLUTTONY_POTATO_SALAD",
        "OVERHEAT_GINGER_SALAD",
        "SPORE_MUSHROOM_SALAD",
        "CALM_MIND_FRUIT_SALAD",
        "SLOWPOKE_TAIL_PEPPER_SALAD",
        "NINJA_SALAD",
        "WARM_MOOMOO_MILK",
        "FANCY_APPLE_JUICE",
        "CRAFT_SODA_POP",
        "LUCKY_CHANT_APPLE_PIE",
        "FLUFFY_SWEET_POTATOES",
        "EMBER_GINGER_TEA",
        "CLOUD_NINE_SOY_CAKE",
        "STALWART_VEGETABLE_JUICE",
        "BIG_MALASADA",
        "HUSTLE_PROTEIN_SMOOTHIE",
        "HUGE_POWER_SOY_DONUTS",
        "SWEET_SCENT_CHOCOLATE_CAKE",
        "PETAL_DANCE_CHOCOLATE_TART",
        "LOVELY_KISS_SMOOTHIE",
        "STEADFAST_GINGER_COOKIES",
        "NEROLIS_RESTORATIVE_TEA",
        "EXPLOSION_POPCORN",
        "JIGGLYPUFFS_FRUITY_FLAN",
      ]
    `);
  });
});

describe('getDefaultMealTimes', () => {
  it('shall return default meal times late in each window', () => {
    const mealTimes = getDefaultMealTimes(MOCKED_MAIN_SLEEP);
    const prettifiedTimes = mealTimes.map((t) => prettifyTime(t));
    expect(prettifiedTimes).toMatchInlineSnapshot(`
      [
        "11:59:00",
        "17:59:00",
        "21:30:00",
      ]
    `);
  });

  it('shall skip dinner if we are sleeping', () => {
    const mealTimes = getDefaultMealTimes({
      start: parseTime('06:00'),
      end: parseTime('17:00'),
    });
    const prettifiedTimes = mealTimes.map((t) => prettifyTime(t));
    expect(prettifiedTimes).toMatchInlineSnapshot(`
      [
        "11:59:00",
        "17:00:00",
      ]
    `);
  });

  it('shall work with night schedule', () => {
    const mealTimes = getDefaultMealTimes({
      start: parseTime('17:00'),
      end: parseTime('05:00'),
    });
    const prettifiedTimes = mealTimes.map((t) => prettifyTime(t));
    expect(prettifiedTimes).toMatchInlineSnapshot(`
      [
        "17:59:00",
        "03:59:00",
        "05:00:00",
      ]
    `);
  });
});

describe('getMealRecoveryAmount', () => {
  it('shall return 0 for currentEnergy >= 100', () => {
    expect(getMealRecoveryAmount(100)).toBe(0);
    expect(getMealRecoveryAmount(150)).toBe(0);
  });

  it('shall return 1 for 80 <= currentEnergy < 100', () => {
    expect(getMealRecoveryAmount(80)).toBe(1);
    expect(getMealRecoveryAmount(99)).toBe(1);
  });

  it('shall return 2 for 60 <= currentEnergy < 80', () => {
    expect(getMealRecoveryAmount(60)).toBe(2);
    expect(getMealRecoveryAmount(79)).toBe(2);
  });

  it('shall return 3 for 40 <= currentEnergy < 60', () => {
    expect(getMealRecoveryAmount(40)).toBe(3);
    expect(getMealRecoveryAmount(59)).toBe(3);
  });

  it('shall return 4 for 20 <= currentEnergy < 40', () => {
    expect(getMealRecoveryAmount(20)).toBe(4);
    expect(getMealRecoveryAmount(39)).toBe(4);
  });

  it('shall return 5 for currentEnergy < 20', () => {
    expect(getMealRecoveryAmount(19)).toBe(5);
    expect(getMealRecoveryAmount(0)).toBe(5);
  });
});

describe('calculateCritMultiplier', () => {
  it('shall calculate crit multplier for TASTY_CHANCE_S', () => {
    const skillActivations: SkillActivation[] = [
      {
        adjustedAmount: mainskill.TASTY_CHANCE_S.amount[mainskill.TASTY_CHANCE_S.maxLevel - 1],
        fractionOfProc: 1,
        nrOfHelpsToActivate: 0,
        skill: mainskill.TASTY_CHANCE_S,
      },
      {
        adjustedAmount: mainskill.TASTY_CHANCE_S.amount[mainskill.TASTY_CHANCE_S.maxLevel - 1],
        fractionOfProc: 1,
        nrOfHelpsToActivate: 0,
        skill: mainskill.TASTY_CHANCE_S,
      },
      {
        adjustedAmount: mainskill.TASTY_CHANCE_S.amount[mainskill.TASTY_CHANCE_S.maxLevel - 1],
        fractionOfProc: 1,
        nrOfHelpsToActivate: 0,
        skill: mainskill.TASTY_CHANCE_S,
      },
    ];
    const {
      critMultiplier,
      weekdayMultiplier,
      sundayMultiplier,
      fullWeekCritChance,
      weekdayCritChance,
      sundayCritChance,
    } = calculateCritMultiplier(skillActivations, new Map());
    expect(roundDown(critMultiplier, 1)).toMatchInlineSnapshot(`1.4`);
    expect(roundDown(weekdayMultiplier, 1)).toMatchInlineSnapshot(`1.3`);
    expect(roundDown(sundayMultiplier, 1)).toMatchInlineSnapshot(`2`);
    expect(Math.abs(fullWeekCritChance - 35)).toBeLessThanOrEqual(2);
    expect(Math.abs(weekdayCritChance - 33)).toBeLessThanOrEqual(2);
    expect(Math.abs(sundayCritChance - 50)).toBeLessThanOrEqual(2);
  });

  it('shall calculate default crit multiplier', () => {
    const skillActivations: SkillActivation[] = [
      { adjustedAmount: 18, fractionOfProc: 1, nrOfHelpsToActivate: 0, skill: mainskill.ENERGY_FOR_EVERYONE },
    ];
    const {
      critMultiplier,
      weekdayMultiplier,
      sundayMultiplier,
      fullWeekCritChance,
      weekdayCritChance,
      sundayCritChance,
    } = calculateCritMultiplier(skillActivations, new Map());
    expect(roundDown(critMultiplier, 1)).toMatchInlineSnapshot(`1.2`);
    expect(roundDown(weekdayMultiplier, 1)).toMatchInlineSnapshot(`1.1`);
    expect(roundDown(sundayMultiplier, 1)).toMatchInlineSnapshot(`1.6`);
    expect(Math.abs(fullWeekCritChance - 13)).toBeLessThanOrEqual(2);
    expect(Math.abs(weekdayCritChance - 10)).toBeLessThanOrEqual(2);
    expect(Math.abs(sundayCritChance - 30)).toBeLessThanOrEqual(2);
  });

  it('shall use cached results', () => {
    const cache = new Map();
    const critInfo: CritInfo = {
      critMultiplier: 0,
      fullWeekCritChance: 0,
      sundayCritChance: 0,
      sundayMultiplier: 0,
      weekdayCritChance: 0,
      weekdayMultiplier: 0,
    };
    cache.set(0, critInfo);

    const result = calculateCritMultiplier([], cache);
    expect(result).toEqual(critInfo);
  });
});
