import { ScheduledEvent } from '@src/domain/event/event';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event';
import { HelpEvent } from '@src/domain/event/events/help-event/help-event';
import { InventoryEvent } from '@src/domain/event/events/inventory-event/inventory-event';
import { SleepInfo } from '@src/domain/sleep/sleep-info';
import { nature } from 'sleepapi-common';
import { countInventory } from '../inventory-utils/inventory-utils';
import { MOCKED_PRODUCE } from '../test-utils/defaults';
import {
  addSneakySnackEvent,
  getDefaultRecoveryEvents,
  helpEvent,
  inventoryFull,
  recoverEnergyEvents,
  recoverFromMeal,
  scheduleNapEvent,
  scheduleTeamEnergyEvents,
} from './event-utils';

describe('scheduleNapEvent', () => {
  it('adds a nap event to the recovery events array when nap info is provided', () => {
    const recoveryEvents: EnergyEvent[] = [];
    const nap: SleepInfo = {
      period: {
        start: { hour: 14, minute: 0, second: 0 },
        end: { hour: 15, minute: 30, second: 0 },
      },
      nature: nature.BASHFUL,
      incense: false,
      erb: 0,
    };

    const updatedRecoveryEvents = scheduleNapEvent(recoveryEvents, nap);

    expect(updatedRecoveryEvents.length).toBe(1);
    const napEvent = updatedRecoveryEvents[0];
    expect(napEvent.description).toEqual('Nap');
    expect(napEvent.time).toEqual(nap.period.start);
    expect(napEvent.delta).toEqual(17.65);
  });

  it('returns the original array unchanged when no nap info is provided', () => {
    const recoveryEvents = [
      new EnergyEvent({
        time: { hour: 10, minute: 0, second: 0 },
        description: 'Morning Exercise',
        delta: 20,
      }),
    ];

    const updatedRecoveryEvents = scheduleNapEvent(recoveryEvents);

    expect(updatedRecoveryEvents).toEqual(recoveryEvents);
    expect(updatedRecoveryEvents.length).toBe(1);
  });
});

describe('scheduleEnergyForEveryoneEvents', () => {
  it('does not add events when e4eProcs is 0', () => {
    const recoveryEvents: EnergyEvent[] = [];
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };
    const updatedRecoveryEvents = scheduleTeamEnergyEvents(recoveryEvents, period, 0, 0, nature.BASHFUL);

    expect(updatedRecoveryEvents.length).toBe(0);
  });

  it('adds correct number of events based on e4eProcs', () => {
    const recoveryEvents: EnergyEvent[] = [];
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };
    const e4eProcs = 4;
    const updatedRecoveryEvents = scheduleTeamEnergyEvents(recoveryEvents, period, e4eProcs, 0, nature.RELAXED);

    expect(updatedRecoveryEvents.length).toBe(e4eProcs);
    updatedRecoveryEvents.forEach((event) => {
      expect(event).toBeInstanceOf(EnergyEvent);
      const energyEvent = event as EnergyEvent;
      expect(energyEvent.description).toEqual('E4E');
      expect(energyEvent.delta).toEqual(21.6);
    });
  });

  it('adds correct number of events based on e4eProcs and cheerProcs', () => {
    const recoveryEvents: EnergyEvent[] = [];
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };
    const e4eProcs = 4;
    const cheerProcs = 4;
    const updatedRecoveryEvents = scheduleTeamEnergyEvents(
      recoveryEvents,
      period,
      e4eProcs,
      cheerProcs,
      nature.RELAXED
    );

    expect(updatedRecoveryEvents.length).toBe(e4eProcs + cheerProcs);
    updatedRecoveryEvents.forEach((event) => {
      expect(event).toBeInstanceOf(EnergyEvent);
    });
  });
});

describe('getDefaultRecoveryEvents', () => {
  it('adds both nap and E4E events when provided', () => {
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };
    const e4eProcs = 2;
    const nap = {
      period: { start: { hour: 13, minute: 0, second: 0 }, end: { hour: 14, minute: 30, second: 0 } },
      nature: nature.BASHFUL,
      incense: false,
      erb: 0,
    };

    const recoveryEvents = getDefaultRecoveryEvents(period, nature.BASHFUL, e4eProcs, 0, nap);

    expect(recoveryEvents.length).toBe(3);
  });

  it('adds only E4E events when nap is not provided', () => {
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };
    const e4eProcs = 2;

    const recoveryEvents = getDefaultRecoveryEvents(period, nature.BASHFUL, e4eProcs, 0);

    expect(recoveryEvents.length).toBe(2);
  });

  it('adds only a nap event when e4eProcs is 0', () => {
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };
    const nap = {
      period: { start: { hour: 13, minute: 0, second: 0 }, end: { hour: 14, minute: 30, second: 0 } },
      nature: nature.BASHFUL,
      incense: false,
      erb: 0,
    };

    const recoveryEvents = getDefaultRecoveryEvents(period, nap.nature, 0, 0, nap);

    expect(recoveryEvents.length).toBe(1);
  });

  it('returns an empty array when neither nap nor e4eProcs are provided', () => {
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };

    const recoveryEvents = getDefaultRecoveryEvents(period, nature.BASHFUL, 0, 0);

    expect(recoveryEvents.length).toBe(0);
  });
});

describe('recoverEnergyEvents', () => {
  it('recovers energy without exceeding the cap', () => {
    const currentTime = { hour: 10, minute: 0, second: 0 };
    const currentEnergy = 100;
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 12, minute: 0, second: 0 } };
    const energyEvents = [
      new EnergyEvent({ time: { hour: 9, minute: 30, second: 0 }, description: 'Mid-Morning Boost', delta: 30 }),
      new EnergyEvent({ time: { hour: 9, minute: 40, second: 0 }, description: 'Morning Recovery', delta: 30 }),
    ];
    const eventLog: EnergyEvent[] = [];

    const recoveredEnergy = recoverEnergyEvents({ energyEvents, currentTime, currentEnergy, period, eventLog });

    expect(recoveredEnergy).toBe(50);
    expect(eventLog.length).toBe(2);
    expect(energyEvents.length).toBe(0);
  });

  it('does not recover energy for events outside the period', () => {
    const currentTime = { hour: 12, minute: 0, second: 0 };
    const currentEnergy = 100;
    const period = { start: { hour: 11, minute: 0, second: 0 }, end: { hour: 13, minute: 0, second: 0 } };
    const energyEvents = [
      new EnergyEvent({ time: { hour: 9, minute: 30, second: 0 }, description: 'Early Morning Recovery', delta: 30 }),
    ];
    const eventLog: EnergyEvent[] = [];

    const recoveredEnergy = recoverEnergyEvents({ energyEvents, currentTime, currentEnergy, period, eventLog });

    expect(recoveredEnergy).toBe(0);
    expect(eventLog.length).toBe(0);
    expect(energyEvents.length).toBe(1);
  });

  it('correctly processes multiple events without exceeding energy cap', () => {
    const currentTime = { hour: 10, minute: 0, second: 0 };
    const currentEnergy = 140;
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 11, minute: 0, second: 0 } };
    const energyEvents = [
      new EnergyEvent({ time: { hour: 9, minute: 30, second: 0 }, description: 'Morning Recovery', delta: 10 }),
      new EnergyEvent({ time: { hour: 10, minute: 30, second: 0 }, description: 'Mid-Morning Boost', delta: 20 }),
    ];
    const eventLog: EnergyEvent[] = [];

    const recoveredEnergy = recoverEnergyEvents({ energyEvents, currentTime, currentEnergy, period, eventLog });

    expect(recoveredEnergy).toBe(10);
    expect(eventLog.length).toBe(1);
    expect(energyEvents.length).toBe(1);
  });
});

describe('recoverFromMeal', () => {
  it('recovers energy and logs event for a meal within the period', () => {
    const currentEnergy = 80;
    const currentTime = { hour: 12, minute: 0, second: 0 };
    const period = { start: { hour: 11, minute: 30, second: 0 }, end: { hour: 12, minute: 30, second: 0 } };
    const mealEvents = [{ hour: 12, minute: 0, second: 0 }];
    const eventLog: EnergyEvent[] = [];

    const recoveredAmount = recoverFromMeal({ currentEnergy, currentTime, period, eventLog, mealTimes: mealEvents });

    expect(recoveredAmount).toBeGreaterThan(0);
    expect(mealEvents.length).toBe(0);
    expect(eventLog.length).toBe(1);
    expect(eventLog[0].description).toBe('Meal');
  });

  it('does not recover energy or log event for a meal outside the period', () => {
    const currentEnergy = 80;
    const currentTime = { hour: 12, minute: 0, second: 0 };
    const period = { start: { hour: 13, minute: 0, second: 0 }, end: { hour: 14, minute: 0, second: 0 } };
    const mealEvents = [{ hour: 11, minute: 50, second: 0 }];
    const eventLog: EnergyEvent[] = [];

    const recoveredAmount = recoverFromMeal({ currentEnergy, currentTime, period, eventLog, mealTimes: mealEvents });

    expect(recoveredAmount).toBe(0);
    expect(mealEvents.length).toBe(1);
    expect(eventLog.length).toBe(0);
  });
});

describe('inventoryFull', () => {
  it('returns true and logs an event when inventory becomes full', () => {
    const currentInventory = MOCKED_PRODUCE;
    const averageProduceAmount = 3; // Amount that makes the inventory full
    const inventoryLimit = 5;
    const currentTime = { hour: 10, minute: 0, second: 0 };
    const eventLog: ScheduledEvent[] = [];

    const isFull = inventoryFull({
      currentInventory,
      averageProduceAmount,
      inventoryLimit,
      currentTime,
      eventLog,
    });

    expect(isFull).toBe(true);
    expect(eventLog.length).toBe(1);
    const emptyInvEvent = eventLog[0] as InventoryEvent;
    expect(emptyInvEvent.description).toBe('Empty');
    expect(emptyInvEvent.before).toBe(3);
    expect(emptyInvEvent.delta).toBe(-3);
  });

  it('returns false and does not log an event when inventory is not full', () => {
    const currentInventory = MOCKED_PRODUCE;
    const averageProduceAmount = 1;
    const inventoryLimit = 5;
    const currentTime = { hour: 10, minute: 0, second: 0 };
    const eventLog: ScheduledEvent[] = [];

    const isFull = inventoryFull({
      currentInventory,
      averageProduceAmount,
      inventoryLimit,
      currentTime,
      eventLog,
    });

    expect(isFull).toBe(false);
    expect(eventLog.length).toBe(0);
  });
});

describe('helpEvent', () => {
  it('logs HelpEvent and InventoryEvent correctly', () => {
    const time = { hour: 10, minute: 30, second: 0 };
    const frequency = 2;
    const produce = MOCKED_PRODUCE;
    const amount = 5;
    const currentInventory = MOCKED_PRODUCE;
    const inventoryLimit = 20;
    const nextHelp = { hour: 12, minute: 30, second: 0 };
    const eventLog: ScheduledEvent[] = [];

    helpEvent({
      time,
      frequency,
      produce,
      amount,
      currentInventory,
      inventoryLimit,
      nextHelp,
      eventLog,
    });

    expect(eventLog.length).toBe(2);
    expect(eventLog[0]).toBeInstanceOf(HelpEvent);
    const helpEvnt = eventLog[0] as HelpEvent;
    expect(helpEvnt.description).toBe('Help');
    expect(helpEvnt.frequency).toBe(frequency);
    expect(helpEvnt.produce).toBe(produce);
    expect(helpEvnt.nextHelp).toEqual(nextHelp);

    const invEvent = eventLog[1] as InventoryEvent;
    expect(invEvent).toBeInstanceOf(InventoryEvent);
    expect(invEvent.description).toBe('Add');
    expect(invEvent.delta).toBe(amount);
    expect(invEvent.before).toBe(3);
    expect(invEvent.max).toBe(inventoryLimit);
  });
});

describe('addSneakySnackEvent', () => {
  it('correctly logs sneaky snack and spilled ingredients events', () => {
    const currentTime = { hour: 14, minute: 45, second: 0 };
    const frequency = 3;
    const sneakySnackProduce = MOCKED_PRODUCE;
    const totalSneakySnack = MOCKED_PRODUCE;
    const spilledProduce = MOCKED_PRODUCE;
    const totalSpilledIngredients = MOCKED_PRODUCE;
    const nextHelp = { hour: 16, minute: 0, second: 0 };
    const eventLog: ScheduledEvent[] = [];

    addSneakySnackEvent({
      currentTime,
      frequency,
      sneakySnackProduce,
      totalSneakySnack,
      spilledProduce,
      totalSpilledIngredients,
      nextHelp,
      eventLog,
    });

    expect(eventLog.length).toBe(3);
    expect(eventLog[0]).toBeInstanceOf(HelpEvent);
    const helpEvent = eventLog[0] as HelpEvent;
    expect(helpEvent.description).toBe('Sneaky snack');
    expect(helpEvent.frequency).toBe(frequency);
    expect(helpEvent.produce).toEqual(sneakySnackProduce);
    expect(helpEvent.nextHelp).toEqual(nextHelp);

    expect(eventLog[1]).toBeInstanceOf(InventoryEvent);
    const ssEvent = eventLog[1] as InventoryEvent;
    expect(ssEvent.description).toBe('Sneaky snack');
    expect(ssEvent.delta).toBe(countInventory(sneakySnackProduce)); // Assuming this calculates to 2 for apples
    expect(ssEvent.before).toBe(countInventory(totalSneakySnack)); // Assuming this calculates to 5 for apples

    expect(eventLog[2]).toBeInstanceOf(InventoryEvent);
    const spilledIngEvent = eventLog[2] as InventoryEvent;
    expect(spilledIngEvent.description).toBe('Spilled ingredients');
    expect(spilledIngEvent.delta).toBe(countInventory(spilledProduce)); // Assuming this calculates to 1 for oranges
    expect(spilledIngEvent.before).toBe(countInventory(totalSpilledIngredients)); // Assuming this calculates to 2 for oranges
  });
});
