import { FANCY_APPLE, HONEY } from '../../domain/produce/ingredient';
import { prettifyIngredientDrop } from './json-utils';

describe('prettifyIngredientDrop', () => {
  it('shall prettify an ingredient list', () => {
    const rawCombination = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 7, ingredient: HONEY },
    ];
    expect(prettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(`"2 Honey, 5 Apple, 7 Honey"`);
  });
});
