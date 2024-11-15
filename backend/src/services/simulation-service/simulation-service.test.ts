import { SummaryEvent } from '@src/domain/event/events/summary-event/summary-event';
import { MOCKED_OPTIMAL_PRODUCTION_STATS, MOCKED_POKEMON, MOCKED_PRODUCE } from '@src/utils/test-utils/defaults';
import { MEALS_IN_DAY } from 'sleepapi-common';
import { setupAndRunProductionSimulation } from './simulation-service';

describe('setupAndRunProductionSimulation', () => {
  it('shall setup and run a basic simulation', () => {
    const { detailedProduce, log, skillActivations } = setupAndRunProductionSimulation({
      input: MOCKED_OPTIMAL_PRODUCTION_STATS,
      monteCarloIterations: 1,
      pokemonCombination: { pokemon: MOCKED_POKEMON, ingredientList: MOCKED_PRODUCE.ingredients },
    });

    expect(skillActivations).toMatchInlineSnapshot(`
      [
        {
          "adjustedAmount": 2535.705616670246,
          "fractionOfProc": 0.5577883010713256,
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
            "amount": [
              880,
              1251,
              1726,
              2383,
              3290,
              4546,
              6409,
            ],
            "description": "Increases Snorlax's Strength by ?.",
            "maxLevel": 7,
            "modifier": {
              "critChance": 0,
              "type": "Base",
            },
            "name": "Charge Strength M",
            "unit": "strength",
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
              5843,
            ],
            "amount": [
              880,
              1251,
              1726,
              2383,
              3290,
              4546,
              6409,
            ],
            "description": "Increases Snorlax's Strength by ?.",
            "maxLevel": 7,
            "modifier": {
              "critChance": 0,
              "type": "Base",
            },
            "name": "Charge Strength M",
            "unit": "strength",
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
              5843,
            ],
            "amount": [
              880,
              1251,
              1726,
              2383,
              3290,
              4546,
              6409,
            ],
            "description": "Increases Snorlax's Strength by ?.",
            "maxLevel": 7,
            "modifier": {
              "critChance": 0,
              "type": "Base",
            },
            "name": "Charge Strength M",
            "unit": "strength",
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
        "averageTotalSkillProcs": 2.1226022374497338,
        "dayHelps": 54,
        "nightHelps": 20,
        "nightHelpsBeforeSS": 20,
        "produce": {
          "berries": [
            {
              "amount": 46.64959999999999,
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
              "amount": 9.116800000000003,
              "ingredient": {
                "longName": "Fancy Apple",
                "name": "Apple",
                "taxedValue": 23.7,
                "value": 90,
              },
            },
          ],
        },
        "skillActivations": [
          {
            "adjustedAmount": 2535.705616670246,
            "fractionOfProc": 0.5577883010713256,
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
              "amount": [
                880,
                1251,
                1726,
                2383,
                3290,
                4546,
                6409,
              ],
              "description": "Increases Snorlax's Strength by ?.",
              "maxLevel": 7,
              "modifier": {
                "critChance": 0,
                "type": "Base",
              },
              "name": "Charge Strength M",
              "unit": "strength",
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
                5843,
              ],
              "amount": [
                880,
                1251,
                1726,
                2383,
                3290,
                4546,
                6409,
              ],
              "description": "Increases Snorlax's Strength by ?.",
              "maxLevel": 7,
              "modifier": {
                "critChance": 0,
                "type": "Base",
              },
              "name": "Charge Strength M",
              "unit": "strength",
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
                5843,
              ],
              "amount": [
                880,
                1251,
                1726,
                2383,
                3290,
                4546,
                6409,
              ],
              "description": "Increases Snorlax's Strength by ?.",
              "maxLevel": 7,
              "modifier": {
                "critChance": 0,
                "type": "Base",
              },
              "name": "Charge Strength M",
              "unit": "strength",
            },
          },
        ],
        "sneakySnack": [],
        "spilledIngredients": [],
      }
    `);
  });
});
