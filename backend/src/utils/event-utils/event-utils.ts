import { Produce } from '@src/domain/combination/produce';
import { ScheduledEvent } from '@src/domain/event/event';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event';
import { HelpEvent } from '@src/domain/event/events/help-event/help-event';
import { InventoryEvent } from '@src/domain/event/events/inventory-event/inventory-event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { Time, TimePeriod } from '@src/domain/time/time';
import { calculateSleepEnergyRecovery } from '@src/services/calculator/energy/energy-calculator';
import { mainskill, nature } from 'sleepapi-common';
import { countInventory } from '../inventory-utils/inventory-utils';
import { getMealRecoveryAmount } from '../meal-utils/meal-utils';
import { divideTimePeriod, isAfterOrEqualWithinPeriod } from '../time-utils/time-utils';

export function getDefaultRecoveryEvents(
  period: TimePeriod,
  nature: nature.Nature,
  e4eProcs: number,
  cheerProcs: number,
  nap?: SleepInfo
): EnergyEvent[] {
  const recoveryEvents: EnergyEvent[] = [];

  scheduleNapEvent(recoveryEvents, nap);
  scheduleTeamEnergyEvents(recoveryEvents, period, e4eProcs, cheerProcs, nature);

  return recoveryEvents;
}

export function scheduleTeamEnergyEvents(
  recoveryEvents: ScheduledEvent[],
  period: TimePeriod,
  e4eProcs: number,
  cheerProcs: number,
  nature: nature.Nature
): ScheduledEvent[] {
  if (e4eProcs === 0) {
    return recoveryEvents;
  }

  const e4ePeriods: TimePeriod[] = divideTimePeriod(period, Math.floor(e4eProcs));
  for (const period of e4ePeriods) {
    const event: EnergyEvent = new EnergyEvent({
      time: period.start,
      description: 'E4E',
      delta: mainskill.ENERGY_FOR_EVERYONE.amount * nature.energy,
    });
    recoveryEvents.push(event);
  }

  const cheerPeriods: TimePeriod[] = divideTimePeriod(period, Math.floor(cheerProcs));
  for (const period of cheerPeriods) {
    const event: EnergyEvent = new EnergyEvent({
      time: period.start,
      description: 'Energizing Cheer',
      delta: (mainskill.ENERGIZING_CHEER_S.amount * nature.energy) / 5,
    });
    recoveryEvents.push(event);
  }

  return recoveryEvents;
}

export function scheduleNapEvent(recoveryEvents: EnergyEvent[], nap?: SleepInfo) {
  if (nap) {
    const napEvent: EnergyEvent = new EnergyEvent({
      time: nap.period.start,
      description: 'Nap',
      delta: calculateSleepEnergyRecovery(nap),
    });

    recoveryEvents.push(napEvent);
  }
  return recoveryEvents;
}

export function recoverEnergyEvents(params: {
  energyEvents: EnergyEvent[];
  energyIndex: number;
  currentTime: Time;
  currentEnergy: number;
  period: TimePeriod;
  eventLog: ScheduledEvent[];
}) {
  const { energyEvents, currentTime, currentEnergy, period, eventLog } = params;
  let { energyIndex } = params;

  let recoveredEnergy = 0;
  for (; energyIndex < energyEvents.length; energyIndex++) {
    const energyEvent = energyEvents[energyIndex];
    if (isAfterOrEqualWithinPeriod({ currentTime, eventTime: energyEvent.time, period })) {
      const { delta, description } = energyEvent;

      const clampedDelta =
        currentEnergy + recoveredEnergy + delta > 150 ? 150 - currentEnergy - recoveredEnergy : delta;

      const event: EnergyEvent = new EnergyEvent({
        time: currentTime,
        description,
        delta: clampedDelta,
        before: currentEnergy + recoveredEnergy,
      });

      recoveredEnergy += clampedDelta;
      eventLog.push(event);
    } else break;
  }

  return { recoveredEnergy, energyEventsProcessed: energyIndex };
}

export function recoverFromMeal(params: {
  currentEnergy: number;
  currentTime: Time;
  period: TimePeriod;
  eventLog: ScheduledEvent[];
  mealTimes: Time[];
  mealIndex: number;
}) {
  const { currentEnergy, currentTime, period, eventLog, mealTimes } = params;
  let { mealIndex } = params;

  let recoveredAmount = 0;
  for (; mealIndex < mealTimes.length; mealIndex++) {
    const mealTime = mealTimes[mealIndex];
    if (isAfterOrEqualWithinPeriod({ currentTime, eventTime: mealTime, period })) {
      recoveredAmount = getMealRecoveryAmount(currentEnergy);

      const mealEvent: EnergyEvent = new EnergyEvent({
        time: mealTime,
        description: 'Meal',
        delta: recoveredAmount,
        before: currentEnergy,
      });

      eventLog.push(mealEvent);
    } else break;
  }

  return { recoveredAmount, mealsProcessed: mealIndex };
}

export function inventoryFull(params: {
  currentInventory: Produce;
  averageProduceAmount: number;
  inventoryLimit: number;
  currentTime: Time;
  eventLog: ScheduledEvent[];
}) {
  const { currentInventory, averageProduceAmount, inventoryLimit, currentTime, eventLog } = params;
  if (countInventory(currentInventory) + averageProduceAmount >= inventoryLimit) {
    const emptyInventoryEvent: InventoryEvent = new InventoryEvent({
      time: currentTime,
      description: 'Empty',
      delta: -countInventory(currentInventory),
      before: countInventory(currentInventory),
      max: inventoryLimit,
    });

    eventLog.push(emptyInventoryEvent);
    return true;
  } else return false;
}

export function helpEvent(params: {
  time: Time;
  frequency: number;
  produce: Produce;
  amount: number;
  currentInventory: Produce;
  inventoryLimit: number;
  nextHelp: Time;
  eventLog: ScheduledEvent[];
}) {
  const { time, frequency, produce, amount, currentInventory, inventoryLimit, nextHelp, eventLog } = params;
  const helpEvent: HelpEvent = new HelpEvent({
    time,
    description: 'Help',
    frequency,
    produce,
    nextHelp,
  });
  const addInventoryEvent: InventoryEvent = new InventoryEvent({
    time,
    description: 'Add',
    delta: amount,
    before: countInventory(currentInventory),
    max: inventoryLimit,
  });

  eventLog.push(helpEvent);
  eventLog.push(addInventoryEvent);
}

export function addSneakySnackEvent(params: {
  currentTime: Time;
  frequency: number;
  sneakySnackProduce: Produce;
  totalSneakySnack: Produce;
  spilledProduce: Produce;
  totalSpilledIngredients: Produce;
  nextHelp: Time;
  eventLog: ScheduledEvent[];
}) {
  const {
    currentTime,
    frequency,
    sneakySnackProduce,
    totalSneakySnack,
    spilledProduce,
    totalSpilledIngredients,
    nextHelp,
    eventLog,
  } = params;

  const sneakySnackEvent: HelpEvent = new HelpEvent({
    time: currentTime,
    description: 'Sneaky snack',
    frequency,
    produce: sneakySnackProduce,
    nextHelp,
  });
  const addInventoryEvent: InventoryEvent = new InventoryEvent({
    time: currentTime,
    description: 'Sneaky snack',
    delta: countInventory(sneakySnackProduce),
    before: countInventory(totalSneakySnack),
  });
  const spilledIngsEvent: InventoryEvent = new InventoryEvent({
    time: currentTime,
    description: 'Spilled ingredients',
    delta: countInventory(spilledProduce),
    before: countInventory(totalSpilledIngredients),
  });

  eventLog.push(sneakySnackEvent);
  eventLog.push(addInventoryEvent);
  eventLog.push(spilledIngsEvent);
}
