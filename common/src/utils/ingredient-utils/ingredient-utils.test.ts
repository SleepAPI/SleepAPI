import { describe, expect, it } from 'vitest';
import type { IngredientSet } from '../../domain/ingredient/ingredient';
import { FANCY_APPLE, HONEY, INGREDIENTS, SOOTHING_CACAO } from '../../domain/ingredient/ingredients';
import {
  combineSameIngredientsInDrop,
  emptyIngredientInventory,
  getIngredient,
  getIngredientNames,
  prettifyIngredientDrop,
  shortPrettifyIngredientDrop
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

describe('emptyIngredientInventory', () => {
  it('shall return an empty ingredient inventory', () => {
    expect(emptyIngredientInventory()).toEqual([]);
  });
});

describe('combineSameIngredientsInDrop', () => {
  it('shall combine ingredients and leave unique ingredients as is', () => {
    const pinsir: IngredientSet[] = [
      {
        amount: 2,
        ingredient: HONEY
      },
      { amount: 5, ingredient: FANCY_APPLE }
    ];
    const absol: IngredientSet[] = [
      {
        amount: 2,
        ingredient: SOOTHING_CACAO
      },
      { amount: 8, ingredient: FANCY_APPLE }
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
      { amount: 7, ingredient: HONEY }
    ];
    expect(shortPrettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(`"Honey/Apple/Honey"`);
  });
});

describe('prettifyIngredientDrop', () => {
  it('shall prettify an ingredient list', () => {
    const rawCombination = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 7, ingredient: HONEY }
    ];
    expect(prettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(`"2 Honey, 5 Apple, 7 Honey"`);
  });

  it('shall prettify an ingredient drop + ingredient magnet proc', () => {
    const rawCombination = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 7, ingredient: HONEY }
    ];
    INGREDIENTS.map((ingredient) => rawCombination.push({ amount: 0.83761, ingredient }));
    expect(prettifyIngredientDrop(rawCombination)).toMatchInlineSnapshot(
      `"2 Honey, 5 Apple, 7 Honey and 0.84 of all 15 other ingredients"`
    );
  });

  it('shall prettify an isolated ingredient magnet proc', () => {
    const ings = INGREDIENTS.map((ingredient) => ({ amount: 0.83761, ingredient }));
    expect(prettifyIngredientDrop(ings)).toMatchInlineSnapshot(`"0.84 of all 17 ingredients"`);
  });

  it('shall support custom separator', () => {
    const rawCombination: IngredientSet[] = [
      { amount: 2, ingredient: HONEY },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 7, ingredient: HONEY }
    ];
    expect(prettifyIngredientDrop(rawCombination, '/')).toMatchInlineSnapshot(`"2 Honey/5 Apple/7 Honey"`);
  });
});

// describe('percentageCoveredOfRecipe', () => {
//   it('shall successfully calculate expected percentage', () => {
//     const combination: IngredientSetSimple[] = [
//       { amount: 4, ingredient: HONEY.name },
//       { amount: 10, ingredient: FANCY_APPLE.name },
//     ];
//     expect(percentageCoveredOfRecipe(LOVELY_KISS_SMOOTHIE, combination)).toMatchInlineSnapshot(`40`);
//   });

//   it('shall count no matching ingredients as zero percentage', () => {
//     const combination: IngredientSetSimple[] = [];
//     expect(percentageCoveredOfRecipe(LOVELY_KISS_SMOOTHIE, combination)).toMatchInlineSnapshot(`0`);
//   });

//   it('shall limit overflow of ingredients at 100%', () => {
//     const combination: IngredientSetSimple[] = [
//       { amount: 100, ingredient: HONEY.name },
//       { amount: 100, ingredient: FANCY_APPLE.name },
//       { amount: 100, ingredient: SOOTHING_CACAO.name },
//       { amount: 100, ingredient: MOOMOO_MILK.name },
//     ];
//     expect(percentageCoveredOfRecipe(LOVELY_KISS_SMOOTHIE, combination)).toMatchInlineSnapshot(`100`);
//   });

//   it('shall handle combinations with same ingredient twice', () => {
//     const raw: IngredientSetSimple[] = [
//       { amount: 2.79, ingredient: FANCY_APPLE.name },
//       { amount: 5.57, ingredient: FANCY_APPLE.name },
//       { amount: 8.36, ingredient: GREENGRASS_SOYBEANS.name },
//     ];
//     expect(percentageCoveredOfRecipe(FANCY_APPLE_CURRY, raw)).toBe(100);
//   });
// });
