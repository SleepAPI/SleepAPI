import { describe, expect, it } from 'bun:test';
import type { PokemonWithIngredients } from 'sleepapi-common';
import { PINSIR, ingredient, ingredientSetToIntFlat } from 'sleepapi-common';
import { calculateAveragePokemonIngredientSet, getAllIngredientLists } from './ingredient-calculate.js';

describe('getAllIngredientCombinationsFor', () => {
  it('shall find all combinations for given pokemon at level 60', () => {
    expect(getAllIngredientLists(PINSIR, 60)).toMatchInlineSnapshot(`
[
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
      "amount": 5,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 7,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
  ],
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
      "amount": 5,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 8,
      "ingredient": {
        "longName": "Fancy Apple",
        "name": "Apple",
        "taxedValue": 23.7,
        "value": 90,
      },
    },
  ],
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
      "amount": 5,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
    {
      "amount": 7,
      "ingredient": {
        "longName": "Bean Sausage",
        "name": "Sausage",
        "taxedValue": 31,
        "value": 103,
      },
    },
  ],
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
      "amount": 5,
      "ingredient": {
        "longName": "Fancy Apple",
        "name": "Apple",
        "taxedValue": 23.7,
        "value": 90,
      },
    },
    {
      "amount": 7,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
  ],
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
      "amount": 5,
      "ingredient": {
        "longName": "Fancy Apple",
        "name": "Apple",
        "taxedValue": 23.7,
        "value": 90,
      },
    },
    {
      "amount": 8,
      "ingredient": {
        "longName": "Fancy Apple",
        "name": "Apple",
        "taxedValue": 23.7,
        "value": 90,
      },
    },
  ],
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
      "amount": 5,
      "ingredient": {
        "longName": "Fancy Apple",
        "name": "Apple",
        "taxedValue": 23.7,
        "value": 90,
      },
    },
    {
      "amount": 7,
      "ingredient": {
        "longName": "Bean Sausage",
        "name": "Sausage",
        "taxedValue": 31,
        "value": 103,
      },
    },
  ],
]
`);
  });

  it('shall find all combinations for given pokemon at level 30', () => {
    expect(getAllIngredientLists(PINSIR, 30)).toMatchInlineSnapshot(`
[
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
      "amount": 5,
      "ingredient": {
        "longName": "Honey",
        "name": "Honey",
        "taxedValue": 29.8,
        "value": 101,
      },
    },
  ],
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
      "amount": 5,
      "ingredient": {
        "longName": "Fancy Apple",
        "name": "Apple",
        "taxedValue": 23.7,
        "value": 90,
      },
    },
  ],
]
`);
  });
});

// describe('calculateContributedIngredientsValue', () => {
//   it('shall calculate contributed ingredient value correctly for 2x leek Dugtrio', () => {
//     const meal = salad.NINJA_SALAD;
//     const producedIngredients: SimplifiedIngredientSet[] = [
//       {
//         amount: 4.7,
//         ingredient: ingredient.SNOOZY_TOMATO.name,
//       },
//       {
//         amount: 16.4,
//         ingredient: ingredient.LARGE_LEEK.name,
//       },
//     ];

//     const expectedContributedValue = Math.round(
//       recipeLevelBonus[MAX_RECIPE_LEVEL] * (1 + meal.bonus / 100) * (15 * ingredient.LARGE_LEEK.value)
//     );

//     const expectedFillerValue = Math.round(
//       4.7 * ingredient.SNOOZY_TOMATO.taxedValue + 1.4 * ingredient.LARGE_LEEK.taxedValue
//     );

//     const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);
//     expect(Math.round(contributedValue)).toBe(expectedContributedValue);
//     expect(Math.round(fillerValue)).toBe(expectedFillerValue);
//   });

//   it('shall calculate contributed ingredient value correctly for leek/soy Dugtrio', () => {
//     const meal = salad.NINJA_SALAD;
//     const producedIngredients: SimplifiedIngredientSet[] = [
//       {
//         amount: 4.4,
//         ingredient: ingredient.SNOOZY_TOMATO.name,
//       },
//       {
//         amount: 6.5,
//         ingredient: ingredient.LARGE_LEEK.name,
//       },
//       {
//         amount: 17.4,
//         ingredient: ingredient.GREENGRASS_SOYBEANS.name,
//       },
//     ];

//     const expectedContributedValue = Math.round(
//       recipeLevelBonus[MAX_RECIPE_LEVEL] *
//         (1 + meal.bonus / 100) *
//         (17.4 * ingredient.GREENGRASS_SOYBEANS.value + 6.5 * ingredient.LARGE_LEEK.value)
//     );

//     const expectedFillerValue = Math.round(
//       4.4 * ingredient.SNOOZY_TOMATO.taxedValue + 0 * ingredient.GREENGRASS_SOYBEANS.taxedValue
//     );
//     const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);
//     expect(Math.round(contributedValue)).toBe(expectedContributedValue);
//     expect(Math.round(fillerValue)).toBe(expectedFillerValue);
//   });
// });

describe('calculateAveragePokemonIngredientSet', () => {
  it('shall average an ingredient set for level 100', () => {
    const pokemonSet: PokemonWithIngredients = {
      pokemon: PINSIR,
      ingredientList: [
        {
          amount: 3,
          ingredient: ingredient.FANCY_APPLE
        },
        {
          amount: 3,
          ingredient: ingredient.FANCY_EGG
        },
        {
          amount: 3,
          ingredient: ingredient.MOOMOO_MILK
        }
      ]
    };
    const averagedResult = calculateAveragePokemonIngredientSet(ingredientSetToIntFlat(pokemonSet.ingredientList), 100);
    expect(averagedResult).toMatchInlineSnapshot(`
Float32Array [
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
]
`);
  });
  it('shall average an ingredient set for level 60', () => {
    const pokemonSet: PokemonWithIngredients = {
      pokemon: PINSIR,
      ingredientList: [
        {
          amount: 3,
          ingredient: ingredient.FANCY_APPLE
        },
        {
          amount: 3,
          ingredient: ingredient.FANCY_EGG
        },
        {
          amount: 3,
          ingredient: ingredient.MOOMOO_MILK
        }
      ]
    };
    const averagedResult = calculateAveragePokemonIngredientSet(ingredientSetToIntFlat(pokemonSet.ingredientList), 60);
    expect(averagedResult).toMatchInlineSnapshot(`
Float32Array [
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
]
`);
  });

  it('shall average an ingredient set for level 30', () => {
    const pokemonSet: PokemonWithIngredients = {
      pokemon: PINSIR,
      ingredientList: [
        {
          amount: 4,
          ingredient: ingredient.FANCY_APPLE
        },
        {
          amount: 4,
          ingredient: ingredient.FANCY_EGG
        }
      ]
    };

    const averagedResult = calculateAveragePokemonIngredientSet(ingredientSetToIntFlat(pokemonSet.ingredientList), 30);
    expect(averagedResult).toMatchInlineSnapshot(`
Float32Array [
  2,
  0,
  0,
  0,
  0,
  0,
  0,
  2,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
]
`);
  });
});
