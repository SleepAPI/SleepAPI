import { Produce } from '@src/domain/combination/produce';
import { ProductionStats } from '@src/domain/computed/production';
import { ScheduledEvent } from '@src/domain/event/event';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event';
import { PlayerInputEvent, PokemonInputEvent, TeamInputEvent } from '@src/domain/event/events/input-event/input-event';
import { InventoryEvent } from '@src/domain/event/events/inventory-event/inventory-event';
import { SleepEvent } from '@src/domain/event/events/sleep-event/sleep-event';
import { Summary, SummaryEvent } from '@src/domain/event/events/summary-event/summary-event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { TimePeriod } from '@src/domain/time/time';
import { calculateStartingEnergy } from '@src/services/calculator/energy/energy-calculator';
import { pokemon } from 'sleepapi-common';
import { countInventory } from '../inventory-utils/inventory-utils';

export function startDayAndEnergy(
  dayInfo: SleepInfo,
  pokemon: pokemon.Pokemon,
  input: ProductionStats,
  recoveryEvents: EnergyEvent[],
  eventLog: ScheduledEvent[]
) {
  const { startingEnergy, energyLeftInMorning, energyRecovered } = calculateStartingEnergy({
    dayPeriod: dayInfo,
    recoveryEvents,
  });
  const startingDayEvent: SleepEvent = new SleepEvent({
    time: dayInfo.period.start,
    description: 'Day start',
    period: { start: dayInfo.period.end, end: dayInfo.period.start },
    sleepState: 'end',
  });

  const inputPokemon: PokemonInputEvent = new PokemonInputEvent({
    time: dayInfo.period.start,
    description: 'Input',
    input,
    pokemon,
  });
  const inputTeam: TeamInputEvent = new TeamInputEvent({
    time: dayInfo.period.start,
    description: 'Input',
    input,
  });
  const inputPlayer: PlayerInputEvent = new PlayerInputEvent({
    time: dayInfo.period.start,
    description: 'Input',
    input,
  });

  const energyEvent: EnergyEvent = new EnergyEvent({
    time: dayInfo.period.start,
    description: 'Sleep',
    delta: energyRecovered,
    before: energyLeftInMorning,
  });

  eventLog.push(startingDayEvent);
  eventLog.push(inputPokemon);
  eventLog.push(inputTeam);
  eventLog.push(inputPlayer);
  eventLog.push(energyEvent);

  return startingEnergy;
}

export function startNight(params: {
  period: TimePeriod;
  currentInventory: Produce;
  inventoryLimit: number;
  eventLog: ScheduledEvent[];
}) {
  const { period, currentInventory, inventoryLimit, eventLog } = params;

  const emptyInventoryEvent: InventoryEvent = new InventoryEvent({
    time: period.end,
    description: 'Empty',
    delta: -countInventory(currentInventory),
    before: countInventory(currentInventory),
    max: inventoryLimit,
  });

  const sleepStartEvent: SleepEvent = new SleepEvent({
    time: period.end,
    description: 'Day end',
    period,
    sleepState: 'start',
  });

  eventLog.push(emptyInventoryEvent);
  eventLog.push(sleepStartEvent);
}

export function finishSimulation(params: {
  period: TimePeriod;
  currentInventory: Produce;
  totalSneakySnack: Produce;
  inventoryLimit: number;
  summary: Summary;
  eventLog: ScheduledEvent[];
}) {
  const { period, currentInventory, totalSneakySnack, inventoryLimit, summary, eventLog } = params;

  const endingDay: SleepEvent = new SleepEvent({
    time: period.end,
    description: 'Night ended',
    period,
    sleepState: 'end',
  });

  const sneakySnackClaim: InventoryEvent = new InventoryEvent({
    time: period.end,
    description: 'Sneaky snack claim',
    delta: -countInventory(totalSneakySnack),
    before: countInventory(totalSneakySnack),
  });

  const morningEmptyInventoryEvent: InventoryEvent = new InventoryEvent({
    time: period.end,
    description: 'Empty',
    delta: -countInventory(currentInventory),
    before: countInventory(currentInventory),
    max: inventoryLimit,
  });

  const summaryEvent: SummaryEvent = new SummaryEvent({
    time: period.end,
    description: 'Summary',
    summary,
  });

  eventLog.push(endingDay);
  eventLog.push(sneakySnackClaim);
  eventLog.push(morningEmptyInventoryEvent);
  eventLog.push(summaryEvent);
}