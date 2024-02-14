import { PokemonProduce } from '@src/domain/combination/produce';
import { ProductionStats } from '@src/domain/computed/production';
import { SummaryEvent } from '@src/domain/event/events/summary-event/summary-event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { MOCKED_MAIN_SLEEP, MOCKED_OPTIMAL_PRODUCTION_STATS, MOCKED_PRODUCE } from '@src/utils/test-utils/defaults';
import { pokemon } from 'sleepapi-common';
import { simulation } from './simulator';

describe('simulation', () => {
  it('shall run the simulation', () => {
    const input: ProductionStats = MOCKED_OPTIMAL_PRODUCTION_STATS;
    const dayInfo: SleepInfo = {
      period: { end: MOCKED_MAIN_SLEEP.end, start: MOCKED_MAIN_SLEEP.start },
      erb: input.erb,
      incense: input.incense,
      nature: input.nature,
    };
    const pokemonWithAverageProduce: PokemonProduce = {
      pokemon: pokemon.ABOMASNOW,
      produce: MOCKED_PRODUCE,
    };

    const { log, detailedProduce } = simulation({
      dayInfo,
      input,
      helpFrequency: 2200,
      recoveryEvents: [],
      pokemonWithAverageProduce,
      sneakySnackBerries: MOCKED_PRODUCE.berries,
    });

    expect(log).toHaveLength(281);
    const summaryLog = log.at(-1) as SummaryEvent;
    expect(summaryLog.description).toBe('Summary');

    expect(summaryLog.summary.totalProduce).toEqual(detailedProduce.produce);
  });
});
