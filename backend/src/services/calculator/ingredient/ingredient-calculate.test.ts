import type { OptimalTeamSolution } from '@src/domain/combination/combination';
import type { IngredientSet, PokemonIngredientSet } from 'sleepapi-common';
import { MAX_RECIPE_LEVEL, curry, dessert, ingredient, pokemon, recipeLevelBonus, salad } from 'sleepapi-common';
import {
  addIngredientSet,
  calculateAveragePokemonIngredientSet,
  calculateContributedIngredientsValue,
  calculatePercentageCoveredByCombination,
  calculateRemainingIngredients,
  combineIngredientDrops,
  extractRelevantSurplus,
  getAllIngredientCombinationsForLevel,
  sortByMinimumFiller
} from './ingredient-calculate';

describe('calculatePercentageCoveredByCombination', () => {
  it('shall successfully calculate expected percentage', () => {
    const combination: IngredientSet[] = [
      { amount: 4, ingredient: ingredient.HONEY },
      { amount: 10, ingredient: ingredient.FANCY_APPLE }
    ];
    expect(calculatePercentageCoveredByCombination(dessert.LOVELY_KISS_SMOOTHIE, combination)).toMatchInlineSnapshot(
      `40`
    );
  });

  it('shall count no matching ingredients as zero percentage', () => {
    const combination: IngredientSet[] = [];
    expect(calculatePercentageCoveredByCombination(dessert.LOVELY_KISS_SMOOTHIE, combination)).toMatchInlineSnapshot(
      `0`
    );
  });

  it('shall limit overflow of ingredients at 100%', () => {
    const combination: IngredientSet[] = [
      { amount: 100, ingredient: ingredient.HONEY },
      { amount: 100, ingredient: ingredient.FANCY_APPLE },
      { amount: 100, ingredient: ingredient.SOOTHING_CACAO },
      { amount: 100, ingredient: ingredient.MOOMOO_MILK }
    ];
    expect(calculatePercentageCoveredByCombination(dessert.LOVELY_KISS_SMOOTHIE, combination)).toMatchInlineSnapshot(
      `100`
    );
  });

  it('shall handle combinations with same ingredient twice', () => {
    const raw = [
      { amount: 2.79, ingredient: { name: 'Apple', value: '90.00' } },
      { amount: 5.57, ingredient: { name: 'Apple', value: '90.00' } },
      { amount: 8.36, ingredient: { name: 'Soybeans', value: '100.00' } }
    ] as unknown as IngredientSet[];
    expect(calculatePercentageCoveredByCombination(curry.FANCY_APPLE_CURRY, raw)).toBe(100);
  });
});

describe('getAllIngredientCombinationsFor', () => {
  it('shall find all combinations for given pokemon at level 60', () => {
    expect(getAllIngredientCombinationsForLevel(pokemon.PINSIR, 60)).toMatchInlineSnapshot(`
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
    expect(getAllIngredientCombinationsForLevel(pokemon.PINSIR, 30)).toMatchInlineSnapshot(`
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

describe('comineIngredientDrops', () => {
  it('shall combine two ingredient drop arrays', () => {
    const arr1: IngredientSet[] = [
      {
        amount: 1.1,
        ingredient: ingredient.HONEY
      },
      { amount: 5, ingredient: ingredient.FANCY_APPLE },
      { amount: 5, ingredient: ingredient.HONEY }
    ];
    const arr2: IngredientSet[] = [
      {
        amount: 1,
        ingredient: ingredient.HONEY
      },
      { amount: 2.27, ingredient: ingredient.FANCY_APPLE },
      { amount: 4, ingredient: ingredient.HONEY }
    ];

    expect(combineIngredientDrops(arr1, arr2)).toMatchInlineSnapshot(`
      [
        {
          "amount": 2.1,
          "ingredient": {
            "longName": "Honey",
            "name": "Honey",
            "taxedValue": 29.8,
            "value": 101,
          },
        },
        {
          "amount": 7.27,
          "ingredient": {
            "longName": "Fancy Apple",
            "name": "Apple",
            "taxedValue": 23.7,
            "value": 90,
          },
        },
        {
          "amount": 9,
          "ingredient": {
            "longName": "Honey",
            "name": "Honey",
            "taxedValue": 29.8,
            "value": 101,
          },
        },
      ]
    `);
  });
});

describe('calculateContributedIngredientsValue', () => {
  it('shall calculate contributed ingredient value correctly for 2x leek Dugtrio', () => {
    const meal = salad.NINJA_SALAD;
    const producedIngredients: IngredientSet[] = [
      {
        amount: 4.7,
        ingredient: ingredient.SNOOZY_TOMATO
      },
      {
        amount: 16.4,
        ingredient: ingredient.LARGE_LEEK
      }
    ];

    const expectedContributedValue = Math.round(
      recipeLevelBonus[MAX_RECIPE_LEVEL] * (1 + meal.bonus / 100) * (15 * ingredient.LARGE_LEEK.value)
    );

    const expectedFillerValue = Math.round(
      4.7 * ingredient.SNOOZY_TOMATO.taxedValue + 1.4 * ingredient.LARGE_LEEK.taxedValue
    );

    const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);
    expect(Math.round(contributedValue)).toBe(expectedContributedValue);
    expect(Math.round(fillerValue)).toBe(expectedFillerValue);
  });

  it('shall calculate contributed ingredient value correctly for leek/soy Dugtrio', () => {
    const meal = salad.NINJA_SALAD;
    const producedIngredients: IngredientSet[] = [
      {
        amount: 4.4,
        ingredient: ingredient.SNOOZY_TOMATO
      },
      {
        amount: 6.5,
        ingredient: ingredient.LARGE_LEEK
      },
      {
        amount: 17.4,
        ingredient: ingredient.GREENGRASS_SOYBEANS
      }
    ];

    const expectedContributedValue = Math.round(
      recipeLevelBonus[MAX_RECIPE_LEVEL] *
        (1 + meal.bonus / 100) *
        (17.4 * ingredient.GREENGRASS_SOYBEANS.value + 6.5 * ingredient.LARGE_LEEK.value)
    );

    const expectedFillerValue = Math.round(
      4.4 * ingredient.SNOOZY_TOMATO.taxedValue + 0 * ingredient.GREENGRASS_SOYBEANS.taxedValue
    );
    const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);
    expect(Math.round(contributedValue)).toBe(expectedContributedValue);
    expect(Math.round(fillerValue)).toBe(expectedFillerValue);
  });
});

describe('calculateRemainingIngredients', () => {
  it('shall calculate remaining ingredients', () => {
    const recipe: IngredientSet[] = [
      {
        amount: 10,
        ingredient: ingredient.FANCY_APPLE
      },
      { amount: 6, ingredient: ingredient.MOOMOO_MILK }
    ];
    const produce: IngredientSet[] = [
      {
        amount: 5,
        ingredient: ingredient.FANCY_APPLE
      },
      { amount: 3, ingredient: ingredient.MOOMOO_MILK }
    ];

    const expectedRemaining: IngredientSet[] = [
      {
        amount: 5,
        ingredient: ingredient.FANCY_APPLE
      },
      { amount: 3, ingredient: ingredient.MOOMOO_MILK }
    ];

    expect(calculateRemainingIngredients(recipe, produce)).toEqual(expectedRemaining);
  });
});

describe('sortByMinimumFiller', () => {
  it('shall sort OptimalTeamSolutions based on the minimum surplus of required ingredients', () => {
    const recipe = [
      { amount: 10, ingredient: ingredient.MOOMOO_MILK },
      { amount: 10, ingredient: ingredient.FANCY_APPLE }
    ];

    const teamSolutions: OptimalTeamSolution[] = [
      {
        team: [],
        surplus: extractRelevantSurplus(recipe, [
          { amount: 2, ingredient: ingredient.MOOMOO_MILK },
          { amount: 2, ingredient: ingredient.FANCY_APPLE }
        ]),
        exhaustive: true
      },
      {
        team: [],
        surplus: extractRelevantSurplus(recipe, [
          { amount: 2, ingredient: ingredient.MOOMOO_MILK },
          { amount: 2, ingredient: ingredient.BEAN_SAUSAGE },
          { amount: 4, ingredient: ingredient.FANCY_APPLE }
        ]),
        exhaustive: true
      },
      {
        team: [],
        surplus: extractRelevantSurplus(recipe, [{ amount: 3, ingredient: ingredient.MOOMOO_MILK }]),
        exhaustive: true
      }
    ];
    const sortedSolutions = sortByMinimumFiller(teamSolutions, recipe);

    expect(sortedSolutions[0].surplus).toEqual(teamSolutions[1].surplus);
    expect(sortedSolutions[1].surplus).toEqual(teamSolutions[0].surplus);
    expect(sortedSolutions[2].surplus).toEqual(teamSolutions[2].surplus);
  });
});

describe('extractRelevantSurplus', () => {
  const MOOMOO_MILK = { name: 'MOOMOO_MILK', value: 1, taxedValue: 1, longName: 'Moomoo Milk' };
  const FANCY_APPLE = { name: 'FANCY_APPLE', value: 1, taxedValue: 1, longName: 'Fancy Apple' };
  const BEAN_SAUSAGE = { name: 'BEAN_SAUSAGE', value: 1, taxedValue: 1, longName: 'Bean Sausage' };

  it('shall correctly categorize relevant and extra surplus ingredients', () => {
    const recipe = [
      { amount: 10, ingredient: MOOMOO_MILK },
      { amount: 5, ingredient: FANCY_APPLE }
    ];

    const surplus = [
      { amount: 2, ingredient: MOOMOO_MILK },
      { amount: 3, ingredient: BEAN_SAUSAGE },
      { amount: 1, ingredient: FANCY_APPLE }
    ];

    const result = extractRelevantSurplus(recipe, surplus);

    expect(result.total).toEqual(surplus);
    expect(result.relevant).toEqual([
      { amount: 2, ingredient: MOOMOO_MILK },
      { amount: 1, ingredient: FANCY_APPLE }
    ]);
    expect(result.extra).toEqual([{ amount: 3, ingredient: BEAN_SAUSAGE }]);
  });

  it('shall return an empty array for extra if all surplus ingredients are relevant', () => {
    const recipe = [{ amount: 10, ingredient: MOOMOO_MILK }];
    const surplus = [{ amount: 2, ingredient: MOOMOO_MILK }];

    const result = extractRelevantSurplus(recipe, surplus);

    expect(result.relevant).toEqual(surplus);
    expect(result.extra).toEqual([]);
  });

  it('shall return an empty array for relevant if no surplus ingredients are in the recipe', () => {
    const recipe = [{ amount: 10, ingredient: MOOMOO_MILK }];
    const surplus = [{ amount: 3, ingredient: BEAN_SAUSAGE }];

    const result = extractRelevantSurplus(recipe, surplus);

    expect(result.relevant).toEqual([]);
    expect(result.extra).toEqual(surplus);
  });
});

describe('calculateAverageIngredientDrop', () => {
  it('shall average an ingredient set for level 60', () => {
    const pokemonSet: PokemonIngredientSet = {
      pokemon: pokemon.PINSIR,
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
    const averagedResult = calculateAveragePokemonIngredientSet(pokemonSet);
    expect(averagedResult.pokemon).toBe(pokemon.PINSIR);
    expect(averagedResult.ingredientList).toMatchInlineSnapshot(`
      [
        {
          "amount": 1,
          "ingredient": {
            "longName": "Fancy Apple",
            "name": "Apple",
            "taxedValue": 23.7,
            "value": 90,
          },
        },
        {
          "amount": 1,
          "ingredient": {
            "longName": "Fancy Egg",
            "name": "Egg",
            "taxedValue": 38.7,
            "value": 115,
          },
        },
        {
          "amount": 1,
          "ingredient": {
            "longName": "Moomoo Milk",
            "name": "Milk",
            "taxedValue": 28.1,
            "value": 98,
          },
        },
      ]
    `);
  });

  it('shall average an ingredient set for level 30', () => {
    const pokemonSet: PokemonIngredientSet = {
      pokemon: pokemon.PINSIR,
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

    const averagedResult = calculateAveragePokemonIngredientSet(pokemonSet);
    expect(averagedResult.pokemon).toBe(pokemon.PINSIR);
    expect(averagedResult.ingredientList).toMatchInlineSnapshot(`
      [
        {
          "amount": 2,
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
            "longName": "Fancy Egg",
            "name": "Egg",
            "taxedValue": 38.7,
            "value": 115,
          },
        },
      ]
    `);
  });
});

describe('addIngredientSet', () => {
  it('shall add two ingredient sets', () => {
    const arr1: IngredientSet[] = [
      {
        amount: 1,
        ingredient: ingredient.FANCY_APPLE
      }
    ];
    const arr2: IngredientSet[] = [
      {
        amount: 1,
        ingredient: ingredient.FANCY_APPLE
      },
      {
        amount: 0.5,
        ingredient: ingredient.FANCY_EGG
      }
    ];
    expect(addIngredientSet(arr1, arr2)).toMatchInlineSnapshot(`
      [
        {
          "amount": 2,
          "ingredient": {
            "longName": "Fancy Apple",
            "name": "Apple",
            "taxedValue": 23.7,
            "value": 90,
          },
        },
        {
          "amount": 0.5,
          "ingredient": {
            "longName": "Fancy Egg",
            "name": "Egg",
            "taxedValue": 38.7,
            "value": 115,
          },
        },
      ]
    `);
  });

  it('shall keep original array if adding empty array', () => {
    const arr1: IngredientSet[] = [
      {
        amount: 1,
        ingredient: ingredient.FANCY_APPLE
      }
    ];
    const arr2: IngredientSet[] = [];
    expect(addIngredientSet(arr1, arr2)).toMatchInlineSnapshot(`
      [
        {
          "amount": 1,
          "ingredient": {
            "longName": "Fancy Apple",
            "name": "Apple",
            "taxedValue": 23.7,
            "value": 90,
          },
        },
      ]
    `);
  });

  it('shall add all ingredients as is if original array empty', () => {
    const arr1: IngredientSet[] = [];
    const arr2: IngredientSet[] = [
      {
        amount: 1,
        ingredient: ingredient.FANCY_APPLE
      }
    ];
    expect(addIngredientSet(arr1, arr2)).toMatchInlineSnapshot(`
      [
        {
          "amount": 1,
          "ingredient": {
            "longName": "Fancy Apple",
            "name": "Apple",
            "taxedValue": 23.7,
            "value": 90,
          },
        },
      ]
    `);
  });
});
