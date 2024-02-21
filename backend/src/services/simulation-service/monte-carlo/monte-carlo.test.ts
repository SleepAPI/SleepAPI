import { MOCKED_MAIN_SLEEP, MOCKED_POKEMON } from '@src/utils/test-utils/defaults';
import { nature } from 'sleepapi-common';
import { monteCarlo } from './monte-carlo';

describe('monteCarlo', () => {
  it('shall run a basic monte carlo simulation', () => {
    const { averageDailySkillProcs, averageNightlySkillProcOdds, dayHelps } = monteCarlo({
      dayInfo: { period: MOCKED_MAIN_SLEEP, erb: 0, incense: false, nature: nature.QUIET },
      helpFrequency: 1000,
      mealTimes: [],
      pokemon: MOCKED_POKEMON,
      recoveryEvents: [],
      skillPercentage: MOCKED_POKEMON.skillPercentage / 100,
      monteCarloIterations: 50,
    });

    expect(dayHelps).toBe(95);
    expect(averageDailySkillProcs).toBeGreaterThan(0);
    expect(averageDailySkillProcs).toBeLessThan(3);
    expect(averageNightlySkillProcOdds).toBeGreaterThan(0);
    expect(averageNightlySkillProcOdds).toBeLessThan(1);
  });
});
