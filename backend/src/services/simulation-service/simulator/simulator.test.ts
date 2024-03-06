import { PokemonProduce } from '@src/domain/combination/produce';
import { EnergyEvent } from '@src/domain/event/events/energy-event/energy-event';
import { SkillEvent } from '@src/domain/event/events/skill-event/skill-event';
import { SummaryEvent } from '@src/domain/event/events/summary-event/summary-event';
import { emptyBerrySet } from '@src/services/calculator/berry/berry-calculator';
import { MOCKED_MAIN_SLEEP, MOCKED_OPTIMAL_PRODUCTION_STATS, MOCKED_POKEMON } from '@src/utils/test-utils/defaults';
import { parseTime } from '@src/utils/time-utils/time-utils';
import { berry, ingredient, mainskill, nature } from 'sleepapi-common';
import { simulation } from './simulator';

describe('simulator', () => {
  it('shall run a basic simulation', () => {
    const { detailedProduce, log } = simulation({
      dayInfo: { period: MOCKED_MAIN_SLEEP, erb: 0, incense: false, nature: nature.QUIET },
      helpFrequency: 1000,
      input: MOCKED_OPTIMAL_PRODUCTION_STATS,
      pokemonWithAverageProduce,
      recoveryEvents: [new EnergyEvent({ delta: 10, description: 'some-desc', time: parseTime('08:00') })],
      extraHelpfulEvents: [
        new SkillEvent({
          description: 'Extra helpful',
          time: parseTime('08:00'),
          skillActivation: {
            skill: mainskill.EXTRA_HELPFUL_S,
            adjustedAmount: 1,
            fractionOfProc: 1,
            nrOfHelpsToActivate: 0,
            adjustedProduce: pokemonWithAverageProduce.produce,
          },
        }),
      ],
      skillActivations: [
        { skill: mainskill.CHARGE_ENERGY_S, adjustedAmount: 1, fractionOfProc: 1, nrOfHelpsToActivate: 0 },
      ],
      sneakySnackBerries: emptyBerrySet(berry.BELUE),
      mealTimes: [],
    });
    expect(log.length).toBeGreaterThan(0);
    const summaryLog = log.at(-1) as SummaryEvent;
    expect(summaryLog.description).toBe('Summary');

    expect(summaryLog.summary.totalProduce).toEqual(detailedProduce.produce);
    expect(detailedProduce).toMatchInlineSnapshot(`
      {
        "averageTotalSkillProcs": 1,
        "dayHelps": 104,
        "nightHelps": 30,
        "produce": {
          "berries": {
            "amount": 223.33333333333334,
            "berry": {
              "name": "BELUE",
              "value": 33,
            },
          },
          "ingredients": [
            {
              "amount": 111.66666666666667,
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
              "amount": [
                12,
                16,
                21,
                26,
                33,
                43,
              ],
              "maxLevel": 6,
              "name": "Charge Energy S",
              "unit": "energy",
            },
          },
        ],
        "sneakySnack": {
          "amount": 0,
          "berry": {
            "name": "BELUE",
            "value": 33,
          },
        },
        "spilledIngredients": [
          {
            "amount": 23.333333333333332,
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
    berries: { berry: berry.BELUE, amount: 2 },
    ingredients: [{ ingredient: ingredient.BEAN_SAUSAGE, amount: 1 }],
  },
};
