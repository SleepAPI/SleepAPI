import type { PokemonProduce } from '@src/domain/combination/produce.js';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event.js';
import { SkillEvent } from '@src/domain/event/events/skill-event/skill-event.js';
import type { SummaryEvent } from '@src/domain/event/events/summary-event/summary-event.js';
import { simulation } from '@src/services/simulation-service/simulator/simulator.js';
import { MOCKED_MAIN_SLEEP, MOCKED_OPTIMAL_PRODUCTION_STATS, MOCKED_POKEMON } from '@src/utils/test-utils/defaults.js';
import {
  berry,
  CarrySizeUtils,
  ChargeEnergyS,
  emptyBerryInventory,
  ExtraHelpfulS,
  HelperBoost,
  ingredient,
  nature,
  parseTime
} from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('simulator', () => {
  it('shall run a basic simulation', () => {
    const { detailedProduce, log } = simulation({
      dayInfo: { period: MOCKED_MAIN_SLEEP, erb: 0, incense: false, nature: nature.QUIET },
      helpFrequency: 1000,
      ingredientPercentage: 0.2,
      skillPercentage: 0.02,
      input: MOCKED_OPTIMAL_PRODUCTION_STATS,
      pokemonWithAverageProduce,
      inventoryLimit: CarrySizeUtils.baseCarrySize(pokemonWithAverageProduce.pokemon),
      recoveryEvents: [new EnergyEvent({ delta: 10, description: 'some-desc', time: parseTime('08:00') })],
      extraHelpfulEvents: [
        new SkillEvent({
          description: 'Extra helpful',
          time: parseTime('08:00'),
          skillActivation: {
            skill: ExtraHelpfulS,
            adjustedAmount: 1,
            fractionOfProc: 1,
            nrOfHelpsToActivate: 0,
            adjustedProduce: pokemonWithAverageProduce.produce
          }
        })
      ],
      helperBoostEvents: [
        new SkillEvent({
          description: 'Helper boost',
          time: parseTime('08:00'),
          skillActivation: {
            skill: HelperBoost,
            adjustedAmount: 1,
            fractionOfProc: 1,
            nrOfHelpsToActivate: 0,
            adjustedProduce: pokemonWithAverageProduce.produce
          }
        })
      ],
      skillActivations: [{ skill: ChargeEnergyS, adjustedAmount: 1, fractionOfProc: 1, nrOfHelpsToActivate: 0 }],
      sneakySnackBerries: emptyBerryInventory(),
      mealTimes: [],
      maxEnergyRecovery: 100
    });
    expect(log.length).toBeGreaterThan(0);
    const summaryLog = log.at(-1) as SummaryEvent;
    expect(summaryLog.description).toBe('Summary');

    expect(summaryLog.summary.totalProduce).toEqual(detailedProduce.produce);
    expect(detailedProduce).toMatchInlineSnapshot(`
      {
        "averageTotalSkillProcs": 1,
        "dayHelps": 106,
        "nightHelps": 37,
        "nightHelpsBeforeSS": 7,
        "produce": {
          "berries": [
            {
              "amount": 229.33333333333334,
              "berry": {
                "name": "BELUE",
                "type": "steel",
                "value": 33,
              },
              "level": 60,
            },
          ],
          "ingredients": [
            {
              "amount": 114.66666666666667,
              "ingredient": {
                "longName": "Bean Sausage",
                "name": "Sausage",
                "taxedValue": 31,
                "value": 103,
              },
            },
          ],
        },
        "skillActivations": [
          {
            "adjustedAmount": 1,
            "fractionOfProc": 1,
            "nrOfHelpsToActivate": 0,
            "skill": {
              "RP": [
                400,
                569,
                785,
                1083,
                1496,
                2066,
              ],
              "activations": {
                "energy": {
                  "amount": [Function],
                  "unit": "energy",
                },
              },
              "description": [Function],
              "energyAmounts": [
                12,
                16.2,
                21.2,
                26.6,
                33.6,
                43.4,
              ],
              "frontendComponentName": undefined,
              "image": "energy",
              "name": "Charge Energy S",
            },
          },
        ],
        "sneakySnack": [],
        "spilledIngredients": [
          {
            "amount": 30.333333333333332,
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
  });
});

const pokemonWithAverageProduce: PokemonProduce = {
  pokemon: MOCKED_POKEMON,
  produce: {
    berries: [{ berry: berry.BELUE, amount: 2, level: 60 }],
    ingredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 1 }]
  }
};
