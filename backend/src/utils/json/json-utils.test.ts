import { ingredient } from 'sleepapi-common';
import { prettifyIngredientDrop, shortPrettifyIngredientDrop } from './json-utils';

describe('shortPrettifyIngredientDrop', () => {
  it('shall shorten the prettify ingredient drop', () => {
    const rawCombination = [
      { amount: 2, ingredient: ingredient.HONEY },
      { amount: 5, ingredient: ingredient.FANCY_APPLE },
      { amount: 7, ingredient: ingredient.HONEY },
    ];
    expect(shortPrettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(`"Honey/Apple/Honey"`);
  });
});

describe('prettifyIngredientDrop', () => {
  it('shall prettify an ingredient list', () => {
    const rawCombination = [
      { amount: 2, ingredient: ingredient.HONEY },
      { amount: 5, ingredient: ingredient.FANCY_APPLE },
      { amount: 7, ingredient: ingredient.HONEY },
    ];
    expect(prettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(`"2 Honey, 5 Apple, 7 Honey"`);
  });

  it('shall prettify an ingredient drop + ingredient magnet proc', () => {
    const rawCombination = [
      { amount: 2, ingredient: ingredient.HONEY },
      { amount: 5, ingredient: ingredient.FANCY_APPLE },
      { amount: 7, ingredient: ingredient.HONEY },
    ];
    ingredient.INGREDIENTS.map((ingredient) => rawCombination.push({ amount: 0.83761, ingredient }));
    expect(prettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(
      `"2 Honey, 5 Apple, 7 Honey and 0.84 of all other ingredients"`
    );
  });

  it('shall prettify an isolated ingredient magnet proc', () => {
    const ings = ingredient.INGREDIENTS.map((ingredient) => ({ amount: 0.83761, ingredient }));
    expect(prettifyIngredientDrop(ings)).toMatchInlineSnapshot(`"0.84 of all ingredients"`);
  });
});
