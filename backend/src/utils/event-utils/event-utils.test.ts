import type { PokemonProduce } from '@src/domain/combination/produce.js';
import type { ScheduledEvent } from '@src/domain/event/event.js';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event.js';
import { HelpEvent } from '@src/domain/event/events/help-event/help-event.js';
import { InventoryEvent } from '@src/domain/event/events/inventory-event/inventory-event.js';
import { SkillEvent } from '@src/domain/event/events/skill-event/skill-event.js';
import {
  addSneakySnackEvent,
  getDefaultRecoveryEvents,
  getExtraHelpfulEvents,
  getHelperBoostEvents,
  helpEvent,
  inventoryFull,
  recoverEnergyEvents,
  recoverFromMeal,
  scheduleTeamEnergyEvents,
  triggerTeamHelpsEvent
} from '@src/utils/event-utils/event-utils.js';
import { MOCKED_MAIN_SLEEP, MOCKED_PRODUCE } from '@src/utils/test-utils/defaults.js';
import {
  ABOMASNOW,
  CarrySizeUtils,
  EnergyForEveryoneS,
  ExtraHelpfulS,
  MathUtils,
  berry,
  ingredient,
  nature,
  parseTime
} from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('getExtraHelpfulEvents', () => {
  it('shall schedule extra helpful events evenly throughout the day', () => {
    const period = MOCKED_MAIN_SLEEP;
    const procs = 1.5;
    const produce: PokemonProduce = {
      produce: MOCKED_PRODUCE,
      pokemon: ABOMASNOW
    };
    const result = getExtraHelpfulEvents(period, procs, produce);
    expect(result).toMatchInlineSnapshot(`
      [
        SkillEvent {
          "description": "Team Extra Helpful",
          "skillActivation": {
            "adjustedAmount": 2.4,
            "adjustedProduce": {
              "berries": [
                {
                  "amount": 4.8,
                  "berry": {
                    "name": "GREPA",
                    "type": "electric",
                    "value": 25,
                  },
                  "level": 60,
                },
              ],
              "ingredients": [
                {
                  "amount": 2.4,
                  "ingredient": {
                    "longName": "Fancy Apple",
                    "name": "Apple",
                    "taxedValue": 23.7,
                    "value": 90,
                  },
                },
              ],
            },
            "fractionOfProc": 1,
            "nrOfHelpsToActivate": 0,
            "skill": {
              "RP": [
                880,
                1251,
                1726,
                2383,
                3290,
                4546,
                5843,
              ],
              "activations": {
                "helps": {
                  "amount": [Function],
                  "unit": "helps",
                },
              },
              "description": [Function],
              "frontendComponentName": undefined,
              "helpAmounts": [
                6,
                7,
                8,
                9,
                10,
                11,
                12,
              ],
              "image": "helps",
              "name": "Extra Helpful S",
              "targeting": {
                "chanceToTargetLowestMembers": 0,
                "numMonsTargeted": 1,
              },
            },
          },
          "time": {
            "hour": 6,
            "minute": 0,
            "second": 0,
          },
          "type": "skill",
        },
        SkillEvent {
          "description": "Team Extra Helpful",
          "skillActivation": {
            "adjustedAmount": 1.2,
            "adjustedProduce": {
              "berries": [
                {
                  "amount": 2.4,
                  "berry": {
                    "name": "GREPA",
                    "type": "electric",
                    "value": 25,
                  },
                  "level": 60,
                },
              ],
              "ingredients": [
                {
                  "amount": 1.2,
                  "ingredient": {
                    "longName": "Fancy Apple",
                    "name": "Apple",
                    "taxedValue": 23.7,
                    "value": 90,
                  },
                },
              ],
            },
            "fractionOfProc": 0.5,
            "nrOfHelpsToActivate": 0,
            "skill": {
              "RP": [
                880,
                1251,
                1726,
                2383,
                3290,
                4546,
                5843,
              ],
              "activations": {
                "helps": {
                  "amount": [Function],
                  "unit": "helps",
                },
              },
              "description": [Function],
              "frontendComponentName": undefined,
              "helpAmounts": [
                6,
                7,
                8,
                9,
                10,
                11,
                12,
              ],
              "image": "helps",
              "name": "Extra Helpful S",
              "targeting": {
                "chanceToTargetLowestMembers": 0,
                "numMonsTargeted": 1,
              },
            },
          },
          "time": {
            "hour": 16,
            "minute": 20,
            "second": 0,
          },
          "type": "skill",
        },
      ]
    `);
  });
});

describe('getHelperBoostEvents', () => {
  it('shall schedule helper boost events evenly throughout the day', () => {
    const period = MOCKED_MAIN_SLEEP;
    const procs = 1.5;
    const unique = 2;
    const level = 6;
    const produce: PokemonProduce = {
      produce: MOCKED_PRODUCE,
      pokemon: ABOMASNOW
    };
    const result = getHelperBoostEvents(period, procs, unique, level, produce);
    expect(result).toMatchInlineSnapshot(`
      [
        SkillEvent {
          "description": "Team Helper Boost",
          "skillActivation": {
            "adjustedAmount": 6,
            "adjustedProduce": {
              "berries": [
                {
                  "amount": 12,
                  "berry": {
                    "name": "GREPA",
                    "type": "electric",
                    "value": 25,
                  },
                  "level": 60,
                },
              ],
              "ingredients": [
                {
                  "amount": 6,
                  "ingredient": {
                    "longName": "Fancy Apple",
                    "name": "Apple",
                    "taxedValue": 23.7,
                    "value": 90,
                  },
                },
              ],
            },
            "fractionOfProc": 1,
            "nrOfHelpsToActivate": 0,
            "skill": {
              "RP": [
                2800,
                3902,
                5273,
                6975,
                9317,
                12438,
              ],
              "activations": {
                "helps": {
                  "amount": [Function],
                  "unit": "helps",
                },
              },
              "baseAmounts": [
                2,
                3,
                3,
                4,
                4,
                5,
              ],
              "description": [Function],
              "frontendComponentName": undefined,
              "image": "helps",
              "name": "Helper Boost",
              "uniqueBoostTable": {
                "1": [
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                ],
                "2": [
                  0,
                  0,
                  0,
                  0,
                  1,
                  1,
                ],
                "3": [
                  1,
                  1,
                  2,
                  2,
                  3,
                  3,
                ],
                "4": [
                  2,
                  2,
                  3,
                  3,
                  4,
                  4,
                ],
                "5": [
                  4,
                  4,
                  5,
                  5,
                  6,
                  6,
                ],
              },
            },
          },
          "time": {
            "hour": 6,
            "minute": 0,
            "second": 0,
          },
          "type": "skill",
        },
        SkillEvent {
          "description": "Team Helper Boost",
          "skillActivation": {
            "adjustedAmount": 3,
            "adjustedProduce": {
              "berries": [
                {
                  "amount": 6,
                  "berry": {
                    "name": "GREPA",
                    "type": "electric",
                    "value": 25,
                  },
                  "level": 60,
                },
              ],
              "ingredients": [
                {
                  "amount": 3,
                  "ingredient": {
                    "longName": "Fancy Apple",
                    "name": "Apple",
                    "taxedValue": 23.7,
                    "value": 90,
                  },
                },
              ],
            },
            "fractionOfProc": 0.5,
            "nrOfHelpsToActivate": 0,
            "skill": {
              "RP": [
                2800,
                3902,
                5273,
                6975,
                9317,
                12438,
              ],
              "activations": {
                "helps": {
                  "amount": [Function],
                  "unit": "helps",
                },
              },
              "baseAmounts": [
                2,
                3,
                3,
                4,
                4,
                5,
              ],
              "description": [Function],
              "frontendComponentName": undefined,
              "image": "helps",
              "name": "Helper Boost",
              "uniqueBoostTable": {
                "1": [
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                ],
                "2": [
                  0,
                  0,
                  0,
                  0,
                  1,
                  1,
                ],
                "3": [
                  1,
                  1,
                  2,
                  2,
                  3,
                  3,
                ],
                "4": [
                  2,
                  2,
                  3,
                  3,
                  4,
                  4,
                ],
                "5": [
                  4,
                  4,
                  5,
                  5,
                  6,
                  6,
                ],
              },
            },
          },
          "time": {
            "hour": 16,
            "minute": 20,
            "second": 0,
          },
          "type": "skill",
        },
      ]
    `);
  });
});

describe('scheduleEnergyForEveryoneEvents', () => {
  it('does not add events when e4eProcs is 0', () => {
    const recoveryEvents: EnergyEvent[] = [];
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };
    const updatedRecoveryEvents = scheduleTeamEnergyEvents(recoveryEvents, period, 0, 6, 0, nature.BASHFUL);

    expect(updatedRecoveryEvents.length).toBe(0);
  });

  it('adds correct number of events based on e4eProcs', () => {
    const recoveryEvents: EnergyEvent[] = [];
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };
    const e4eProcs = 4;
    const updatedRecoveryEvents = scheduleTeamEnergyEvents(recoveryEvents, period, e4eProcs, 6, 0, nature.RELAXED);

    expect(updatedRecoveryEvents.length).toBe(e4eProcs);
    updatedRecoveryEvents.forEach((event) => {
      expect(event).toBeInstanceOf(EnergyEvent);
      const energyEvent = event as EnergyEvent;
      expect(energyEvent.description).toEqual('E4E');
      expect(energyEvent.delta).toEqual(
        MathUtils.round(EnergyForEveryoneS.activations.energy.amount({ skillLevel: 6 }) * nature.RELAXED.energy, 2)
      );
    });
  });

  it('adds correct number of events based on e4eProcs and cheerProcs', () => {
    const recoveryEvents: EnergyEvent[] = [];
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };
    const e4eProcs = 4;
    const e4eLevel = 6;
    const cheerProcs = 4;
    const updatedRecoveryEvents = scheduleTeamEnergyEvents(
      recoveryEvents,
      period,
      e4eProcs,
      e4eLevel,
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
  it('returns e4e procs when provided', () => {
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };
    const e4eProcs = 2;
    const e4eLevel = 6;

    const recoveryEvents = getDefaultRecoveryEvents(period, nature.BASHFUL, e4eProcs, e4eLevel, 0);

    expect(recoveryEvents.length).toBe(2);
  });

  it('adds fractioned e4e events', () => {
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };
    const e4eProcs = 1.5;
    const e4eLevel = 6;

    const recoveryEvents = getDefaultRecoveryEvents(period, nature.BASHFUL, e4eProcs, e4eLevel, 0);

    expect(recoveryEvents.length).toBe(2);
    expect(recoveryEvents.map((e) => e.delta)).toEqual([
      EnergyForEveryoneS.activations.energy.amount({ skillLevel: 6 }),
      EnergyForEveryoneS.activations.energy.amount({ skillLevel: 6 }) / 2
    ]);
  });

  it('returns an empty array when no e4eProcs are provided', () => {
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 17, minute: 0, second: 0 } };

    const recoveryEvents = getDefaultRecoveryEvents(period, nature.BASHFUL, 0, 6, 0);

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
      new EnergyEvent({ time: { hour: 9, minute: 40, second: 0 }, description: 'Morning Recovery', delta: 30 })
    ];
    const eventLog: EnergyEvent[] = [];

    const { recoveredEnergy, energyEventsProcessed } = recoverEnergyEvents({
      energyEvents,
      currentTime,
      currentEnergy,
      period,
      eventLog,
      energyIndex: 0
    });

    expect(energyEventsProcessed).toBe(2);
    expect(recoveredEnergy).toBe(50);
    expect(eventLog.length).toBe(2);
    expect(energyEvents.length).toBe(2);
  });

  it('does not recover energy for events outside the period', () => {
    const currentTime = { hour: 12, minute: 0, second: 0 };
    const currentEnergy = 100;
    const period = { start: { hour: 11, minute: 0, second: 0 }, end: { hour: 13, minute: 0, second: 0 } };
    const energyEvents = [
      new EnergyEvent({ time: { hour: 9, minute: 30, second: 0 }, description: 'Early Morning Recovery', delta: 30 })
    ];
    const eventLog: EnergyEvent[] = [];

    const { recoveredEnergy, energyEventsProcessed } = recoverEnergyEvents({
      energyEvents,
      currentTime,
      currentEnergy,
      period,
      eventLog,
      energyIndex: 0
    });

    expect(energyEventsProcessed).toBe(0);
    expect(recoveredEnergy).toBe(0);
    expect(eventLog.length).toBe(0);
    expect(energyEvents.length).toBe(1);
  });

  it('correctly processes multiple events without exceeding energy cap', () => {
    const currentTime = { hour: 10, minute: 30, second: 0 };
    const currentEnergy = 140;
    const period = { start: { hour: 9, minute: 0, second: 0 }, end: { hour: 11, minute: 0, second: 0 } };
    const energyEvents = [
      new EnergyEvent({ time: { hour: 9, minute: 30, second: 0 }, description: 'Morning Recovery', delta: 10 }),
      new EnergyEvent({ time: { hour: 10, minute: 0, second: 0 }, description: 'Mid-Morning Boost', delta: 20 })
    ];
    const eventLog: EnergyEvent[] = [];

    const { recoveredEnergy, energyEventsProcessed } = recoverEnergyEvents({
      energyEvents,
      currentTime,
      currentEnergy,
      period,
      eventLog,
      energyIndex: 0
    });

    expect(energyEventsProcessed).toBe(2);
    expect(recoveredEnergy).toBe(10); // 20 wasted since 150 cap
    expect(eventLog.length).toBe(2);
  });
});

describe('recoverFromMeal', () => {
  it('recovers energy and logs event for a meal within the period', () => {
    const currentEnergy = 80;
    const currentTime = { hour: 12, minute: 0, second: 0 };
    const period = { start: { hour: 11, minute: 30, second: 0 }, end: { hour: 12, minute: 30, second: 0 } };
    const mealEvents = [{ hour: 12, minute: 0, second: 0 }];
    const eventLog: EnergyEvent[] = [];

    const { recoveredAmount, mealsProcessed } = recoverFromMeal({
      currentEnergy,
      currentTime,
      period,
      eventLog,
      mealTimes: mealEvents,
      mealIndex: 0
    });

    expect(mealsProcessed).toBe(1);
    expect(recoveredAmount).toBeGreaterThan(0);
    expect(mealEvents.length).toBe(1);
    expect(eventLog.length).toBe(1);
    expect(eventLog[0].description).toBe('Meal');
  });

  it('does not recover energy or log event for a meal outside the period', () => {
    const currentEnergy = 80;
    const currentTime = { hour: 12, minute: 0, second: 0 };
    const period = { start: { hour: 13, minute: 0, second: 0 }, end: { hour: 14, minute: 0, second: 0 } };
    const mealEvents = [{ hour: 11, minute: 50, second: 0 }];
    const eventLog: EnergyEvent[] = [];

    const { recoveredAmount, mealsProcessed } = recoverFromMeal({
      currentEnergy,
      currentTime,
      period,
      eventLog,
      mealTimes: mealEvents,
      mealIndex: 0
    });

    expect(recoveredAmount).toBe(0);
    expect(mealsProcessed).toBe(0);
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
      eventLog
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
      eventLog
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
      eventLog
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
      eventLog
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
    expect(ssEvent.delta).toBe(CarrySizeUtils.countInventory(sneakySnackProduce)); // Assuming this calculates to 2 for apples
    expect(ssEvent.before).toBe(CarrySizeUtils.countInventory(totalSneakySnack)); // Assuming this calculates to 5 for apples

    expect(eventLog[2]).toBeInstanceOf(InventoryEvent);
    const spilledIngEvent = eventLog[2] as InventoryEvent;
    expect(spilledIngEvent.description).toBe('Spilled ingredients');
    expect(spilledIngEvent.delta).toBe(CarrySizeUtils.countInventory(spilledProduce)); // Assuming this calculates to 1 for oranges
    expect(spilledIngEvent.before).toBe(CarrySizeUtils.countInventory(totalSpilledIngredients)); // Assuming this calculates to 2 for oranges
  });
});

describe('triggerTeamHelpsEvent', () => {
  it('shall trigger 2nd event in the day correctly', () => {
    const eventLog: ScheduledEvent[] = [];
    const helpfulEvents: SkillEvent[] = [
      new SkillEvent({
        description: '1',
        time: parseTime('06:00'),
        skillActivation: {
          skill: ExtraHelpfulS,
          adjustedAmount: 1,
          fractionOfProc: 1,
          nrOfHelpsToActivate: 1,
          adjustedProduce: CarrySizeUtils.getEmptyInventory()
        }
      }),
      new SkillEvent({
        description: '1',
        time: parseTime('13:00'),
        skillActivation: {
          skill: ExtraHelpfulS,
          adjustedAmount: 2,
          fractionOfProc: 2,
          nrOfHelpsToActivate: 2,
          adjustedProduce: {
            berries: [
              {
                amount: 2,
                berry: berry.BLUK,
                level: 60
              }
            ],
            ingredients: [
              {
                amount: 2,
                ingredient: ingredient.BEAN_SAUSAGE
              }
            ]
          }
        }
      })
    ];

    const result = triggerTeamHelpsEvent({
      helpEvents: helpfulEvents,
      currentTime: parseTime('13:00'),
      emptyProduce: CarrySizeUtils.getEmptyInventory(),
      eventLog,
      helpIndex: 1,
      period: MOCKED_MAIN_SLEEP
    });

    expect(result.helpEventsProcessed).toMatchInlineSnapshot(`2`);
    expect(result.helpsProduce).toMatchInlineSnapshot(`
{
  "berries": [
    {
      "amount": 2,
      "berry": {
        "name": "BLUK",
        "type": "ghost",
        "value": 26,
      },
      "level": 60,
    },
  ],
  "ingredients": [
    {
      "amount": 2,
      "ingredient": {
        "longName": "Bean Sausage",
        "name": "Sausage",
        "taxedValue": 31,
        "value": 103,
      },
    },
  ],
}
`);
    expect(eventLog).toHaveLength(1);
  });
});
