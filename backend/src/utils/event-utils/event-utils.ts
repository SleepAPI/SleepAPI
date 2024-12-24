import type { PokemonProduce } from '@src/domain/combination/produce';
import type { ScheduledEvent } from '@src/domain/event/event';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event';
import { HelpEvent } from '@src/domain/event/events/help-event/help-event';
import { InventoryEvent } from '@src/domain/event/events/inventory-event/inventory-event';
import { SkillEvent } from '@src/domain/event/events/skill-event/skill-event';
import type { SleepInfo } from '@src/domain/sleep/sleep-info';
import { calculateSleepEnergyRecovery } from '@src/services/calculator/energy/energy-calculator';
import { calculateHelperBoostHelpsFromUnique } from '@src/services/calculator/skill/skill-calculator';
import { InventoryUtils } from '@src/utils/inventory-utils/inventory-utils';
import { TimeUtils } from '@src/utils/time-utils/time-utils';
import type { Produce, Time, TimePeriod, nature } from 'sleepapi-common';
import { mainskill, multiplyBerries } from 'sleepapi-common';
import { splitNumber } from '../calculator-utils/calculator-utils';
import { getMealRecoveryAmount } from '../meal-utils/meal-utils';

export function getExtraHelpfulEvents(
  period: TimePeriod,
  extraHelpfulProcs: number,
  averageProduce: PokemonProduce
): SkillEvent[] {
  const helpfulEvents: SkillEvent[] = [];
  const { berries: averageBerries, ingredients: averageIngredients } = averageProduce.produce;

  const extraHelpfulPeriods: TimePeriod[] = TimeUtils.divideTimePeriod(period, extraHelpfulProcs);
  const extraHelpfulFractions: number[] = splitNumber(extraHelpfulProcs);
  for (let i = 0; i < extraHelpfulPeriods.length; i++) {
    const time = extraHelpfulPeriods[i].start;
    const adjustedAmount = (extraHelpfulFractions[i] * mainskill.EXTRA_HELPFUL_S.maxAmount) / 5;

    const event: SkillEvent = new SkillEvent({
      time,
      description: 'Team Extra Helpful',
      skillActivation: {
        fractionOfProc: extraHelpfulFractions[i],
        skill: mainskill.EXTRA_HELPFUL_S,
        adjustedAmount,
        nrOfHelpsToActivate: 0,
        adjustedProduce: {
          berries: multiplyBerries(averageBerries, adjustedAmount),
          ingredients: averageIngredients.map(({ amount, ingredient }) => ({
            ingredient,
            amount: amount * adjustedAmount
          }))
        }
      }
    });
    helpfulEvents.push(event);
  }

  return helpfulEvents;
}

export function getHelperBoostEvents(
  period: TimePeriod,
  helperBoostProcs: number,
  helperBoostUnique: number,
  helperBoostLevel: number,
  averageProduce: PokemonProduce
): SkillEvent[] {
  if (helperBoostProcs === 0) {
    return [];
  }
  const helpfulEvents: SkillEvent[] = [];
  const { berries: averageBerries, ingredients: averageIngredients } = averageProduce.produce;

  const nrOfHelps =
    mainskill.HELPER_BOOST.amount(helperBoostLevel) +
    calculateHelperBoostHelpsFromUnique(helperBoostUnique, helperBoostLevel);

  const helperBoostPeriods: TimePeriod[] = TimeUtils.divideTimePeriod(period, helperBoostProcs);
  const helperBoostFractions: number[] = splitNumber(helperBoostProcs);
  for (let i = 0; i < helperBoostPeriods.length; i++) {
    const time = helperBoostPeriods[i].start;
    const adjustedAmount = helperBoostFractions[i] * nrOfHelps;

    const event: SkillEvent = new SkillEvent({
      time,
      description: 'Team Helper Boost',
      skillActivation: {
        fractionOfProc: helperBoostFractions[i],
        skill: mainskill.HELPER_BOOST,
        adjustedAmount,
        nrOfHelpsToActivate: 0,
        adjustedProduce: {
          berries: multiplyBerries(averageBerries, adjustedAmount),
          ingredients: averageIngredients.map(({ amount, ingredient }) => ({
            ingredient,
            amount: amount * adjustedAmount
          }))
        }
      }
    });
    helpfulEvents.push(event);
  }

  return helpfulEvents;
}

export function getDefaultRecoveryEvents(
  period: TimePeriod,
  nature: nature.Nature,
  e4eProcs: number,
  e4eLevel: number,
  cheerProcs: number,
  nap?: SleepInfo
): EnergyEvent[] {
  const recoveryEvents: EnergyEvent[] = [];

  scheduleNapEvent(recoveryEvents, nap);
  scheduleTeamEnergyEvents(recoveryEvents, period, e4eProcs, e4eLevel, cheerProcs, nature);

  return recoveryEvents;
}

// schedules using max skill level
export function scheduleTeamEnergyEvents(
  recoveryEvents: EnergyEvent[],
  period: TimePeriod,
  e4eProcs: number,
  e4eLevel: number,
  cheerProcs: number,
  nature: nature.Nature
): EnergyEvent[] {
  if (e4eProcs === 0 && cheerProcs === 0) {
    return recoveryEvents;
  }

  const e4ePeriods: TimePeriod[] = TimeUtils.divideTimePeriod(period, e4eProcs);
  const e4eDeltas: number[] = splitNumber(e4eProcs);
  for (let i = 0; i < e4ePeriods.length; i++) {
    const event: EnergyEvent = new EnergyEvent({
      time: e4ePeriods[i].start,
      description: 'E4E',
      delta: e4eDeltas[i] * mainskill.ENERGY_FOR_EVERYONE.amount(e4eLevel) * nature.energy
    });
    recoveryEvents.push(event);
  }

  const cheerPeriods: TimePeriod[] = TimeUtils.divideTimePeriod(period, cheerProcs);
  const cheerDeltas: number[] = splitNumber(cheerProcs);
  for (let i = 0; i < cheerPeriods.length; i++) {
    const event: EnergyEvent = new EnergyEvent({
      time: cheerPeriods[i].start,
      description: 'Energizing Cheer',
      delta: (cheerDeltas[i] * (mainskill.ENERGIZING_CHEER_S.maxAmount * nature.energy)) / 5
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
      delta: calculateSleepEnergyRecovery(nap)
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
    if (TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime: energyEvent.time, period })) {
      const { delta, description } = energyEvent;

      const clampedDelta =
        currentEnergy + recoveredEnergy + delta > 150 ? 150 - currentEnergy - recoveredEnergy : delta;

      const event: EnergyEvent = new EnergyEvent({
        time: currentTime,
        description,
        delta: clampedDelta,
        before: currentEnergy + recoveredEnergy
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
    if (TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime: mealTime, period })) {
      recoveredAmount = getMealRecoveryAmount(currentEnergy);

      const mealEvent: EnergyEvent = new EnergyEvent({
        time: mealTime,
        description: 'Meal',
        delta: recoveredAmount,
        before: currentEnergy
      });

      eventLog.push(mealEvent);
    } else break;
  }

  return { recoveredAmount, mealsProcessed: mealIndex };
}

export function triggerTeamHelpsEvent(params: {
  helpEvents: SkillEvent[];
  helpIndex: number;
  emptyProduce: Produce;
  currentTime: Time;
  period: TimePeriod;
  eventLog: ScheduledEvent[];
}) {
  const { helpEvents, emptyProduce, currentTime, period, eventLog } = params;
  let helpIndex = params.helpIndex;

  let helpsProduce: Produce = emptyProduce;
  for (; helpIndex < helpEvents.length; helpIndex++) {
    const helpEvent = helpEvents[helpIndex];
    if (TimeUtils.isAfterOrEqualWithinPeriod({ currentTime, eventTime: helpEvent.time, period })) {
      helpsProduce = InventoryUtils.addToInventory(helpsProduce, helpEvent.skillActivation.adjustedProduce!);

      eventLog.push(helpEvent);
    } else break;
  }
  return { helpsProduce, helpEventsProcessed: helpIndex };
}

export function inventoryFull(params: {
  currentInventory: Produce;
  averageProduceAmount: number;
  inventoryLimit: number;
  currentTime: Time;
  eventLog: ScheduledEvent[];
}) {
  const { currentInventory, averageProduceAmount, inventoryLimit, currentTime, eventLog } = params;
  if (InventoryUtils.countInventory(currentInventory) + averageProduceAmount >= inventoryLimit) {
    const emptyInventoryEvent: InventoryEvent = new InventoryEvent({
      time: currentTime,
      description: 'Empty',
      delta: -InventoryUtils.countInventory(currentInventory),
      before: InventoryUtils.countInventory(currentInventory),
      max: inventoryLimit,
      contents: InventoryUtils.getEmptyInventory()
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
    nextHelp
  });
  const addInventoryEvent: InventoryEvent = new InventoryEvent({
    time,
    description: 'Add',
    delta: amount,
    before: InventoryUtils.countInventory(currentInventory),
    max: inventoryLimit,
    contents: InventoryUtils.addToInventory(currentInventory, produce)
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
    eventLog
  } = params;

  const sneakySnackEvent: HelpEvent = new HelpEvent({
    time: currentTime,
    description: 'Sneaky snack',
    frequency,
    produce: sneakySnackProduce,
    nextHelp
  });
  const addInventoryEvent: InventoryEvent = new InventoryEvent({
    time: currentTime,
    description: 'Sneaky snack',
    delta: InventoryUtils.countInventory(sneakySnackProduce),
    before: InventoryUtils.countInventory(totalSneakySnack),
    contents: InventoryUtils.addToInventory(totalSneakySnack, sneakySnackProduce)
  });
  const spilledIngsEvent: InventoryEvent = new InventoryEvent({
    time: currentTime,
    description: 'Spilled ingredients',
    delta: InventoryUtils.countInventory(spilledProduce),
    before: InventoryUtils.countInventory(totalSpilledIngredients),
    contents: InventoryUtils.addToInventory(totalSpilledIngredients, spilledProduce)
  });

  eventLog.push(sneakySnackEvent);
  eventLog.push(addInventoryEvent);
  eventLog.push(spilledIngsEvent);
}
