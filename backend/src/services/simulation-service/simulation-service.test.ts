import type { SummaryEvent } from '@src/domain/event/events/summary-event/summary-event.js';
import { setupAndRunProductionSimulation } from '@src/services/simulation-service/simulation-service.js';
import { MOCKED_OPTIMAL_PRODUCTION_STATS, MOCKED_POKEMON } from '@src/utils/test-utils/defaults.js';
import { MEALS_IN_DAY } from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('setupAndRunProductionSimulation', () => {
  it('shall setup and run a basic simulation', () => {
    const { detailedProduce, log, skillActivations } = setupAndRunProductionSimulation({
      input: MOCKED_OPTIMAL_PRODUCTION_STATS,
      monteCarloIterations: 1,
      pokemonSet: {
        pokemon: MOCKED_POKEMON,
        ingredientList: [MOCKED_POKEMON.ingredient0[0], MOCKED_POKEMON.ingredient30[0], MOCKED_POKEMON.ingredient60[0]]
      }
    });

    expect(skillActivations).toMatchInlineSnapshot(`
      [
        {
          "adjustedAmount": 1933.6456764800878,
          "fractionOfProc": 0.42535100670481474,
          "nrOfHelpsToActivate": 0,
          "skill": {
            "RP": [
              880,
              1251,
              1726,
              2383,
              3290,
              4546,
              6252,
            ],
            "activations": {
              "strength": {
                "amount": [Function],
                "unit": "strength",
              },
            },
            "description": [Function],
            "frontendComponentName": undefined,
            "image": "strength",
            "name": "Charge Strength M",
            "strengthAmounts": [
              880,
              1251,
              1726,
              2383,
              3290,
              4546,
              6858,
            ],
          },
        },
        {
          "adjustedAmount": 4546,
          "fractionOfProc": 1,
          "nrOfHelpsToActivate": 34,
          "skill": {
            "RP": [
              880,
              1251,
              1726,
              2383,
              3290,
              4546,
              6252,
            ],
            "activations": {
              "strength": {
                "amount": [Function],
                "unit": "strength",
              },
            },
            "description": [Function],
            "frontendComponentName": undefined,
            "image": "strength",
            "name": "Charge Strength M",
            "strengthAmounts": [
              880,
              1251,
              1726,
              2383,
              3290,
              4546,
              6858,
            ],
          },
        },
        {
          "adjustedAmount": 2567.6441547762433,
          "fractionOfProc": 0.5648139363784082,
          "nrOfHelpsToActivate": 54,
          "skill": {
            "RP": [
              880,
              1251,
              1726,
              2383,
              3290,
              4546,
              6252,
            ],
            "activations": {
              "strength": {
                "amount": [Function],
                "unit": "strength",
              },
            },
            "description": [Function],
            "frontendComponentName": undefined,
            "image": "strength",
            "name": "Charge Strength M",
            "strengthAmounts": [
              880,
              1251,
              1726,
              2383,
              3290,
              4546,
              6858,
            ],
          },
        },
      ]
    `);

    expect(log.length).toBeGreaterThan(0);
    const summaryLog = log.at(-1) as SummaryEvent;
    expect(summaryLog.description).toBe('Summary');

    expect(Math.round(summaryLog.summary.totalProduce.ingredients[0].amount)).toEqual(
      Math.round(detailedProduce.produce.ingredients[0].amount * MEALS_IN_DAY)
    );

    expect(detailedProduce).toMatchInlineSnapshot(`
      {
        "averageTotalSkillProcs": 1.990164943083223,
        "dayHelps": 54,
        "nightHelps": 21,
        "nightHelpsBeforeSS": 15,
        "produce": {
          "berries": [
            {
              "amount": 49.24720747725384,
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
              "amount": 5.634577239442856,
              "ingredient": {
                "longName": "Fancy Apple",
                "name": "Apple",
                "taxedValue": 23.7,
                "value": 90,
              },
            },
            {
              "amount": 2.817288619721428,
              "ingredient": {
                "longName": "Bean Sausage",
                "name": "Sausage",
                "taxedValue": 31,
                "value": 103,
              },
            },
            {
              "amount": 8.451865348033566,
              "ingredient": {
                "longName": "Fancy Egg",
                "name": "Egg",
                "taxedValue": 38.7,
                "value": 115,
              },
            },
          ],
        },
        "skillActivations": [
          {
            "adjustedAmount": 1933.6456764800878,
            "fractionOfProc": 0.42535100670481474,
            "nrOfHelpsToActivate": 0,
            "skill": {
              "RP": [
                880,
                1251,
                1726,
                2383,
                3290,
                4546,
                6252,
              ],
              "activations": {
                "strength": {
                  "amount": [Function],
                  "unit": "strength",
                },
              },
              "description": [Function],
              "frontendComponentName": undefined,
              "image": "strength",
              "name": "Charge Strength M",
              "strengthAmounts": [
                880,
                1251,
                1726,
                2383,
                3290,
                4546,
                6858,
              ],
            },
          },
          {
            "adjustedAmount": 4546,
            "fractionOfProc": 1,
            "nrOfHelpsToActivate": 34,
            "skill": {
              "RP": [
                880,
                1251,
                1726,
                2383,
                3290,
                4546,
                6252,
              ],
              "activations": {
                "strength": {
                  "amount": [Function],
                  "unit": "strength",
                },
              },
              "description": [Function],
              "frontendComponentName": undefined,
              "image": "strength",
              "name": "Charge Strength M",
              "strengthAmounts": [
                880,
                1251,
                1726,
                2383,
                3290,
                4546,
                6858,
              ],
            },
          },
          {
            "adjustedAmount": 2567.6441547762433,
            "fractionOfProc": 0.5648139363784082,
            "nrOfHelpsToActivate": 54,
            "skill": {
              "RP": [
                880,
                1251,
                1726,
                2383,
                3290,
                4546,
                6252,
              ],
              "activations": {
                "strength": {
                  "amount": [Function],
                  "unit": "strength",
                },
              },
              "description": [Function],
              "frontendComponentName": undefined,
              "image": "strength",
              "name": "Charge Strength M",
              "strengthAmounts": [
                880,
                1251,
                1726,
                2383,
                3290,
                4546,
                6858,
              ],
            },
          },
        ],
        "sneakySnack": [
          {
            "amount": 6,
            "berry": {
              "name": "BELUE",
              "type": "steel",
              "value": 33,
            },
            "level": 60,
          },
        ],
        "spilledIngredients": [
          {
            "amount": 1.576269299122719,
            "ingredient": {
              "longName": "Fancy Apple",
              "name": "Apple",
              "taxedValue": 23.7,
              "value": 90,
            },
          },
          {
            "amount": 0.7881346495613595,
            "ingredient": {
              "longName": "Bean Sausage",
              "name": "Sausage",
              "taxedValue": 31,
              "value": 103,
            },
          },
          {
            "amount": 2.3644038056955945,
            "ingredient": {
              "longName": "Fancy Egg",
              "name": "Egg",
              "taxedValue": 38.7,
              "value": 115,
            },
          },
        ],
      }
    `);
  });
});
