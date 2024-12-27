import type { PokemonProduce } from '@src/domain/combination/produce.js';
import { monteCarlo } from '@src/services/simulation-service/monte-carlo/monte-carlo.js';
import { MOCKED_MAIN_SLEEP, MOCKED_POKEMON } from '@src/utils/test-utils/defaults.js';
import { describe, expect, it } from 'bun:test';
import { berry, ingredient, maxCarrySize, nature } from 'sleepapi-common';

describe('monteCarlo', () => {
  it('shall run a basic monte carlo simulation', () => {
    const { averageDailySkillProcs, averageNightlySkillProcOdds, dayHelps } = monteCarlo({
      dayInfo: { period: MOCKED_MAIN_SLEEP, erb: 0, incense: false, nature: nature.QUIET },
      helpFrequency: 1000,
      mealTimes: [],
      pokemonWithAverageProduce,
      inventoryLimit: maxCarrySize(MOCKED_POKEMON),
      recoveryEvents: [],
      skillPercentage: MOCKED_POKEMON.skillPercentage / 100,
      skillLevel: 6,
      monteCarloIterations: 50
    });

    expect(dayHelps).toBe(102);
    expect(averageDailySkillProcs).toBeGreaterThan(0);
    expect(averageDailySkillProcs).toBeLessThan(3);
    expect(averageNightlySkillProcOdds).toBeGreaterThan(0);
    expect(averageNightlySkillProcOdds).toBeLessThan(1);
  });
});

const pokemonWithAverageProduce: PokemonProduce = {
  pokemon: { ...MOCKED_POKEMON, specialty: 'berry', skillPercentage: 0.02 },
  produce: {
    berries: [{ berry: berry.BELUE, amount: 2, level: 60 }],
    ingredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 1 }]
  }
};
