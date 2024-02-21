import { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom';
import { PokemonError } from '@src/domain/error/pokemon/pokemon-error';
import { ScheduledEvent } from '@src/domain/event/event';
import { berry, ingredient, nature, pokemon } from 'sleepapi-common';
import { chooseIngredientSet } from './production-utils';

describe('chooseIngredientSets', () => {
  const productionData: { pokemonProduction: CustomPokemonCombinationWithProduce; log: ScheduledEvent[] }[] = [
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
