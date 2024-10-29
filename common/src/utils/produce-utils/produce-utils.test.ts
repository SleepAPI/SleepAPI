import { describe, expect, it } from 'vitest';
import { Produce } from '../../api/production/produce';
import { berry, ingredient } from '../../domain';
import { multiplyProduce } from './produce-utils';

const testProduce: Produce = {
  berries: [
    { berry: berry.ORAN, amount: 10, level: 2 },
    { berry: berry.PECHA, amount: 5, level: 3 },
  ],
  ingredients: [
    { ingredient: ingredient.HONEY, amount: 3 },
    { ingredient: ingredient.FANCY_APPLE, amount: 7 },
  ],
};

describe('multiplyProduce', () => {
  it('multiplies the amount of berries and ingredients by the given factor', () => {
    const result = multiplyProduce(testProduce, 2);
    expect(result).toEqual({
      berries: [
        { berry: berry.ORAN, amount: 20, level: 2 },
        { berry: berry.PECHA, amount: 10, level: 3 },
      ],
      ingredients: [
        { ingredient: ingredient.HONEY, amount: 6 },
        { ingredient: ingredient.FANCY_APPLE, amount: 14 },
      ],
    });
  });

  it('multiplies produce by 1 and returns the same produce', () => {
    const result = multiplyProduce(testProduce, 1);
    expect(result).toEqual(testProduce);
  });

  it('multiplies produce by 0 and returns zero amounts for all produce', () => {
    const result = multiplyProduce(testProduce, 0);
    expect(result).toEqual({
      berries: [
        { berry: berry.ORAN, amount: 0, level: 2 },
        { berry: berry.PECHA, amount: 0, level: 3 },
      ],
      ingredients: [
        { ingredient: ingredient.HONEY, amount: 0 },
        { ingredient: ingredient.FANCY_APPLE, amount: 0 },
      ],
    });
  });
});
