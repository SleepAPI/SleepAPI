import { PokemonProduce } from '@src/domain/combination/produce';
import { MOCKED_MAIN_SLEEP, MOCKED_POKEMON } from '@src/utils/test-utils/defaults';
import { berry, ingredient, maxCarrySize, nature } from 'sleepapi-common';
import { monteCarlo } from './monte-carlo';

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
      monteCarloIterations: 50,
    });

    expect(dayHelps).toBe(102);
    expect(averageDailySkillProcs).toBeGreaterThan(0);
    expect(averageDailySkillProcs).toBeLessThan(3);
    expect(averageNightlySkillProcOdds).toBeGreaterThan(0);
    expect(averageNightlySkillProcOdds).toBeLessThan(1);
  });
});

const pokemonWithAverageProduce: PokemonProduce = {
  pokemon: MOCKED_POKEMON,
  produce: {
    berries: { berry: berry.BELUE, amount: 2 },
    ingredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 1 }],
  },
};
