import { Produce } from '@src/domain/combination/produce';
import { ProductionStats } from '@src/domain/computed/production';
import { TimePeriod } from '@src/domain/time/time';
import { berry, ingredient, nature, subskill } from 'sleepapi-common';

export const MOCKED_MAIN_SLEEP: TimePeriod = {
  start: {
    hour: 6,
    minute: 0,
    second: 0,
  },
  end: {
    hour: 21,
    minute: 30,
    second: 0,
  },
};

export const MOCKED_OPTIMAL_PRODUCTION_STATS: ProductionStats = {
  level: 60,
  nature: nature.RASH,
  subskills: [subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_M, subskill.INGREDIENT_FINDER_S],
  e4e: 0,
  helpingBonus: 0,
  camp: false,
  erb: 0,
  incense: false,
  mainBedtime: MOCKED_MAIN_SLEEP.end,
  mainWakeup: MOCKED_MAIN_SLEEP.start,
};

export const MOCKED_PRODUCE: Produce = {
  berries: {
    amount: 2,
    berry: berry.GREPA,
  },
  ingredients: [
    {
      amount: 1,
      ingredient: ingredient.FANCY_APPLE,
    },
  ],
};
