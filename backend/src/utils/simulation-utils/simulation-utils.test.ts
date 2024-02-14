import { ProductionStats } from '@src/domain/computed/production';
import { ScheduledEvent } from '@src/domain/event/event';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event';
import { Summary } from '@src/domain/event/events/summary-event/summary-event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { nature, pokemon } from 'sleepapi-common';
import { MOCKED_MAIN_SLEEP, MOCKED_OPTIMAL_PRODUCTION_STATS, MOCKED_PRODUCE } from '../test-utils/defaults';
import { finishSimulation, startDayAndEnergy, startNight } from './simulation-utils';

describe('startDayAndEnergy', () => {
  it('shall calculate starting energy and log starting events', () => {
    const eventLog: ScheduledEvent[] = [];
    const dayInfo: SleepInfo = {
      period: MOCKED_MAIN_SLEEP,
      nature: nature.RASH,
      erb: 0,
      incense: false,
    };
    const pkmn = pokemon.PINSIR;
    const input: ProductionStats = MOCKED_OPTIMAL_PRODUCTION_STATS;
    const recoveryEvents: EnergyEvent[] = [];

    expect(startDayAndEnergy(dayInfo, pkmn, input, recoveryEvents, eventLog)).toBe(100);
    expect(eventLog).toHaveLength(5);
  });
});

describe('startNight', () => {
  it('shall push day ending events', () => {
    const eventLog: ScheduledEvent[] = [];

    startNight({ period: MOCKED_MAIN_SLEEP, currentInventory: MOCKED_PRODUCE, inventoryLimit: 2, eventLog });
    expect(eventLog).toHaveLength(2);
  });
});

describe('finishSimulation', () => {
  it('shall push simulation end events', () => {
    const eventLog: ScheduledEvent[] = [];
    const summary: Summary = {
      averageEnergy: 0,
      averageFrequency: 0,
      helpsAfterSS: 0,
      helpsBeforeSS: 0,
      nrOfHelps: 0,
      spilledIngredients: [],
      totalProduce: MOCKED_PRODUCE,
      totalRecovery: 0,
      collectFrequency: MOCKED_MAIN_SLEEP.end,
    };

    finishSimulation({
      period: MOCKED_MAIN_SLEEP,
      currentInventory: MOCKED_PRODUCE,
      totalSneakySnack: MOCKED_PRODUCE,
      inventoryLimit: 2,
      summary,
      eventLog,
    });
    expect(eventLog).toHaveLength(4);
  });
});
