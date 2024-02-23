import { MOCKED_MAIN_SLEEP, MOCKED_POKEMON } from '@src/utils/test-utils/defaults';
import { nature } from 'sleepapi-common';
import { randomizedSimulation } from './randomized-simulator';

describe('randomizedSimulation', () => {
  it('shall run basic randomized simulator', () => {
    const result = randomizedSimulation({
      dayInfo: { period: MOCKED_MAIN_SLEEP, erb: 0, incense: false, nature: nature.QUIET },
      helpFrequency: 1000,
      energyFromYesterday: 0,
      nightHelpsFromYesterday: 0,
      pokemon: MOCKED_POKEMON,
      recoveryEvents: [],
      mealTimes: [],
      skillPercentage: 0.2,
    });

    expect(result.dayHelps).toBe(95);
    expect(result.nightHelps).toBe(31);
    expect(result.endingEnergy).toBe(0);
  });
});
