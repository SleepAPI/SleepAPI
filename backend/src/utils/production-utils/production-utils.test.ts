import { PokemonError } from '@src/domain/error/pokemon/pokemon-error';
import { ingredient, IngredientSet } from 'sleepapi-common';
import { chooseIngredientSets } from './production-utils';

describe('chooseIngredientSets', () => {
  const validSets: IngredientSet[][] = [
    [
      { amount: 1, ingredient: ingredient.MOOMOO_MILK },
      { amount: 1, ingredient: ingredient.FANCY_APPLE },
    ],
    [
      { amount: 2, ingredient: ingredient.BEAN_SAUSAGE },
      { amount: 3, ingredient: ingredient.MOOMOO_MILK },
    ],
  ];

  it('shall return the entire validSets array when ingredientSet is undefined', () => {
    expect(chooseIngredientSets(validSets)).toEqual(validSets);
  });

  it('shall return the matching set for a valid ingredientSet', () => {
    const ingredientSet = [ingredient.MOOMOO_MILK.name, ingredient.FANCY_APPLE.name];
    const expectedSet = [
      [
        { amount: 1, ingredient: ingredient.MOOMOO_MILK },
        { amount: 1, ingredient: ingredient.FANCY_APPLE },
      ],
    ];

    expect(chooseIngredientSets(validSets, ingredientSet)).toEqual(expectedSet);
  });

  it('shall throw an error when the ingredientSet does not match any valid sets', () => {
    const ingredientSet = ['missing ingredient'];

    expect(() => chooseIngredientSets(validSets, ingredientSet)).toThrow(
      new PokemonError(`Ingredient set [${ingredientSet.join(', ')}] was not valid`)
    );
  });
});
