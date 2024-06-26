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
          "adjustedAmount": 1255.6155621865146,
          "fractionOfProc": 0.2762022794075043,
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
            "name": "Charge Strength M",
            "unit": "strength",
          },
        },
        {
          "adjustedAmount": 4546,
          "fractionOfProc": 1,
          "nrOfHelpsToActivate": 50,
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
            "name": "Charge Strength M",
            "unit": "strength",
          },
        },
        {
          "adjustedAmount": 181.84000000000017,
          "fractionOfProc": 0.040000000000000036,
          "nrOfHelpsToActivate": 52,
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
        "averageTotalSkillProcs": 1.3162022794075043,
        "dayHelps": 52,
        "nightHelps": 16,
        "nightHelpsBeforeSS": 16,
        "produce": {
          "berries": {
            "amount": 42.8672,
            "berry": {
              "name": "BELUE",
              "type": "steel",
              "value": 33,
            },
          },
          "ingredients": [
            {
              "amount": 8.377600000000003,
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
            "adjustedAmount": 1255.6155621865146,
            "fractionOfProc": 0.2762022794075043,
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
              "name": "Charge Strength M",
              "unit": "strength",
            },
          },
          {
            "adjustedAmount": 4546,
            "fractionOfProc": 1,
            "nrOfHelpsToActivate": 50,
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
              "name": "Charge Strength M",
              "unit": "strength",
            },
          },
          {
            "adjustedAmount": 181.84000000000017,
            "fractionOfProc": 0.040000000000000036,
            "nrOfHelpsToActivate": 52,
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
              "name": "Charge Strength M",
              "unit": "strength",
            },
          },
        ],
        "sneakySnack": {
          "amount": 0,
          "berry": {
            "name": "BELUE",
            "type": "steel",
            "value": 33,
          },
        },
        "spilledIngredients": [],
      }
    `);
  });
});
