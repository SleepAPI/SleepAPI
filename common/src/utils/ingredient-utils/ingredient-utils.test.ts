import { describe, expect, it } from 'vitest';
import { FANCY_APPLE, HONEY, INGREDIENTS, SOOTHING_CACAO } from '../../domain/ingredient';
import { IngredientSet } from '../../domain/types/ingredient-set';
import {
  combineSameIngredientsInDrop,
  getIngredient,
  getIngredientNames,
  prettifyIngredientDrop,
  shortPrettifyIngredientDrop,
} from './ingredient-utils';

describe('getIngredient', () => {
  it('shall return ingredient for name', () => {
    expect(getIngredient('Honey')).toMatchInlineSnapshot(`
      {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      }
    `);
  });

  it('shall lookup ingredient case-insensitive', () => {
    expect(getIngredient('hOneY')).toMatchInlineSnapshot(`
      {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      }
    `);
  });

  it('shall throw programmer error if ingredient is missing', () => {
    expect(() => getIngredient('missing')).toThrowErrorMatchingInlineSnapshot(
      `[Error: Ingredient with name [missing] does not exist]`,
    );
  });
});

describe('getIngredientNames', () => {
  it('shall get all ingredient names', () => {
    expect(getIngredientNames()).toMatchInlineSnapshot(`
      [
        "Apple",
        "Milk",
        "Soybean",
        "Honey",
        "Sausage",
        "Ginger",
        "Tomato",
        "Egg",
        "Oil",
        "Potato",
        "Herb",
        "Corn",
        "Cacao",
        "Coffee",
        "Mushroom",
        "Leek",
        "Tail",
      ]
    `);
  });
});

describe('combineSameIngredientsInDrop', () => {
  it('shall combine ingredients and leave unique ingredients as is', () => {
    const pinsir: IngredientSet[] = [
      {
        amount: 2,
        ingredient: HONEY,
      },
      { amount: 5, ingredient: FANCY_APPLE },
    ];
    const absol: IngredientSet[] = [
      {
        amount: 2,
        ingredient: SOOTHING_CACAO,
      },
      { amount: 8, ingredient: FANCY_APPLE },
    ];

    expect(combineSameIngredientsInDrop([...pinsir, ...absol])).toMatchInlineSnapshot(`
      [
        {
          "amount": 2,
          "ingredient": {
            "longName": "Honey",
            "name": "Honey",
            "taxedValue": 29.8,
            "value": 101,
          },
        },
        {
          "amount": 13,
          "ingredient": {
            "longName": "Fancy Apple",
            "name": "Apple",
            "taxedValue": 23.7,
            "value": 90,
          },
        },
        {
          "amount": 2,
          "ingredient": {
            "longName": "Soothing Cacao",
            "name": "Cacao",
            "taxedValue": 66.7,
            "value": 151,
          },
        },
      ]
    `);
  });
});

describe('shortPrettifyIngredientDrop', () => {
  it('shall shorten the prettify ingredient drop', () => {
    const rawCombination = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 7, ingredient: HONEY },
    ];
    expect(shortPrettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(`"Honey/Apple/Honey"`);
  });
});

describe('prettifyIngredientDrop', () => {
  it('shall prettify an ingredient list', () => {
    const rawCombination = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 7, ingredient: HONEY },
    ];
    expect(prettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(`"2 Honey, 5 Apple, 7 Honey"`);
  });

  it('shall prettify an ingredient drop + ingredient magnet proc', () => {
    const rawCombination = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 7, ingredient: HONEY },
    ];
    INGREDIENTS.map((ingredient) => rawCombination.push({ amount: 0.83761, ingredient }));
    expect(prettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(
      `"2 Honey, 5 Apple, 7 Honey and 0.84 of all 15 other ingredients"`,
    );
  });

  it('shall prettify an isolated ingredient magnet proc', () => {
    const ings = INGREDIENTS.map((ingredient) => ({ amount: 0.83761, ingredient }));
    expect(prettifyIngredientDrop(ings)).toMatchInlineSnapshot(`"0.84 of all 17 ingredients"`);
  });

  it('shall support custom separator', () => {
    const rawCombination = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 7, ingredient: HONEY },
    ];
    expect(prettifyIngredientDrop(rawCombination, '/')).toMatchInlineSnapshot(`"2 Honey/5 Apple/7 Honey"`);
  });
});
