import { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom';
import { PokemonError } from '@src/domain/error/pokemon/pokemon-error';
import { ScheduledEvent } from '@src/domain/event/event';
import { Summary } from '@src/domain/event/events/summary-event/summary-event';
import { berry, ingredient, mainskill, nature, pokemon } from 'sleepapi-common';
import { MOCKED_PRODUCE } from '../test-utils/defaults';
import { parseTime } from '../time-utils/time-utils';
import { chooseIngredientSet } from './production-utils';

describe('chooseIngredientSets', () => {
  const productionData: {
    pokemonProduction: CustomPokemonCombinationWithProduce;
    log: ScheduledEvent[];
    summary: Summary;
  }[] = [
    {
      log: [],
      pokemonProduction: {
        customStats: {
          level: 60,
          nature: nature.RASH,
          subskills: [],
        },
        detailedProduce: {
          produce: {
            berries: {
              amount: 0,
              berry: berry.BELUE,
            },
            ingredients: [],
          },
          sneakySnack: {
            amount: 0,
            berry: berry.BELUE,
          },
          spilledIngredients: [],
          dayHelps: 0,
          nightHelps: 0,
          averageTotalSkillProcs: 0,
        },
        pokemonCombination: {
          pokemon: pokemon.PINSIR,
          ingredientList: [
            { amount: 1, ingredient: ingredient.MOOMOO_MILK },
            { amount: 1, ingredient: ingredient.FANCY_APPLE },
          ],
        },
      },
      summary: {
        skill: mainskill.CHARGE_STRENGTH_S,
        skillProcs: 11,
        skillEnergySelfValue: 11,
        skillEnergyOthersValue: 11,
        skillProduceValue: MOCKED_PRODUCE,
        skillStrengthValue: 11,
        skillDreamShardValue: 11,
        skillPotSizeValue: 11,
        skillHelpsValue: 11,
        averageEnergy: 0,
        averageFrequency: 1,
        helpsAfterSS: 2,
        helpsBeforeSS: 3,
        nrOfHelps: 5,
        spilledIngredients: MOCKED_PRODUCE.ingredients,
        totalProduce: MOCKED_PRODUCE,
        totalRecovery: 6,
        collectFrequency: parseTime('00:10'),
      },
    },
  ];

  it('shall return the matching set for a valid ingredientSet', () => {
    const ingredientSet = [ingredient.MOOMOO_MILK.name, ingredient.FANCY_APPLE.name];

    expect(chooseIngredientSet(productionData, ingredientSet)).toEqual(productionData[0]);
  });

  it('shall throw an error when the ingredientSet does not match any valid sets', () => {
    const ingredientSet = ['missing ingredient'];

    expect(() => chooseIngredientSet(productionData, ingredientSet)).toThrow(
      new PokemonError(`Ingredient set [${ingredientSet.join(', ')}] was not valid`)
    );
  });
});
