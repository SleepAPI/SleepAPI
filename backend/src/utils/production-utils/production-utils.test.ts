import { PokemonError } from '@src/domain/error/pokemon/pokemon-error';
import { IngredientSet, ingredient } from 'sleepapi-common';
import { getIngredientSet } from './production-utils';

describe('getIngredientSets', () => {
  it('shall return the matching set for a valid ingredientSet', () => {
    const ingredientSet = [ingredient.MOOMOO_MILK.name, ingredient.FANCY_APPLE.name];
    const allIngredientSets: IngredientSet[][] = [
      [
        {
          amount: 1,
          ingredient: ingredient.MOOMOO_MILK,
        },
        {
          amount: 1,
          ingredient: ingredient.MOOMOO_MILK,
        },
      ],
      [
        {
          amount: 1,
          ingredient: ingredient.MOOMOO_MILK,
        },
        {
          amount: 1,
          ingredient: ingredient.FANCY_APPLE,
        },
      ],
    ];

    expect(getIngredientSet(allIngredientSets, ingredientSet)).toEqual(allIngredientSets[1]);
  });

  it('shall throw an error when the ingredientSet does not match any valid sets', () => {
    const ingredientSet = ['missing ingredient'];
    const allIngredientSets = [
      [
        {
          amount: 1,
          ingredient: ingredient.MOOMOO_MILK,
        },
        {
          amount: 1,
          ingredient: ingredient.MOOMOO_MILK,
        },
      ],
    ];

    expect(() => getIngredientSet(allIngredientSets, ingredientSet)).toThrow(
      new PokemonError(`Ingredient set [${ingredientSet.join(', ')}] was not valid`)
    );
  });
});
