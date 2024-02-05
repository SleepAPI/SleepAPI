import { OptimalTeamSolution } from '@src/domain/combination/combination';
import { IngredientSet, PokemonIngredientSet, ingredient, nature, pokemon, recipe, subskill } from 'sleepapi-common';
import {
  calculateContributedIngredientsValue,
  calculatePercentageCoveredByCombination,
  calculateProducePerMealWindow,
  calculateRemainingIngredients,
  combineIngredientDrops,
  combineSameIngredientsInDrop,
  extractRelevantSurplus,
  getAllIngredientCombinationsForLevel,
  sortByMinimumFiller,
} from './ingredient-calculate';

describe('calculateIngredientsProducedPerMeal', () => {
  it('shall calculate realistic pokemon.PINSIR at 30', () => {
    const pokemonCombination: PokemonIngredientSet = {
      pokemon: pokemon.PINSIR,
      ingredientList: [
        { amount: 2, ingredient: ingredient.HONEY },
        { amount: 5, ingredient: ingredient.FANCY_APPLE },
      ],
    };
    const nat = nature.BASHFUL;
    const level = 30;
    const subskills: subskill.SubSkill[] = [subskill.HELPING_SPEED_M];

    const ingredientsDropped = calculateProducePerMealWindow({
      pokemonCombination,
      customStats: { subskills, nature: nat, level },
    });
    expect(ingredientsDropped).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 1.8770668671642428,
        "helpsBeforeSS": 13.863673873576497,
        "produce": {
          "berries": {
            "amount": 50.187551911070756,
            "berry": {
              "name": "LUM",
              "value": 24,
            },
          },
          "ingredients": [
            {
              "amount": 4.337663996343646,
              "ingredient": {
                "longName": "Honey",
                "name": "Honey",
                "taxedValue": 29.8,
                "value": 101,
              },
            },
            {
              "amount": 10.844159990859117,
              "ingredient": {
                "longName": "Fancy Apple",
                "name": "Apple",
                "taxedValue": 23.7,
                "value": 90,
              },
            },
          ],
        },
        "sneakySnack": {
          "amount": 1.8770668671642428,
          "berry": {
            "name": "LUM",
            "value": 24,
          },
        },
        "spilledIngredients": [
          {
            "amount": 0.3864880679491176,
            "ingredient": {
              "longName": "Honey",
              "name": "Honey",
              "taxedValue": 29.8,
              "value": 101,
            },
          },
          {
            "amount": 0.966220169872794,
            "ingredient": {
              "longName": "Fancy Apple",
              "name": "Apple",
              "taxedValue": 23.7,
              "value": 90,
            },
          },
        ],
      }
    `);
  });

  it('shall calculate optimal pokemon with small carry size at 30', () => {
    const pokemonCombination: PokemonIngredientSet = {
      pokemon: pokemon.ABSOL,
      ingredientList: [
        { amount: 2, ingredient: ingredient.SOOTHING_CACAO },
        { amount: 8, ingredient: ingredient.FANCY_APPLE },
      ],
    };
    const nat = nature.RASH;
    const level = 30;
    const subskills: subskill.SubSkill[] = [subskill.INGREDIENT_FINDER_M, subskill.INVENTORY_L];

    const ingredientsDropped = calculateProducePerMealWindow({
      pokemonCombination,
      customStats: { subskills, nature: nat, level },
      helpingBonus: 0,
      e4eProcs: 0,
    });
    expect(ingredientsDropped).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 0,
        "helpsBeforeSS": 10.47945205479452,
        "produce": {
          "berries": {
            "amount": 30.751486098220546,
            "berry": {
              "name": "WIKI",
              "value": 31,
            },
          },
          "ingredients": [
            {
              "amount": 4.190271563707903,
              "ingredient": {
                "longName": "Soothing Cacao",
                "name": "Cacao",
                "taxedValue": 66.7,
                "value": 151,
              },
            },
            {
              "amount": 16.76108625483161,
              "ingredient": {
                "longName": "Fancy Apple",
                "name": "Apple",
                "taxedValue": 23.7,
                "value": 90,
              },
            },
          ],
        },
        "sneakySnack": {
          "amount": 0,
          "berry": {
            "name": "WIKI",
            "value": 31,
          },
        },
        "spilledIngredients": [],
      }
    `);
  });

  it('shall calculate optimal berry specialist at 30', () => {
    const pokemonCombination: PokemonIngredientSet = {
      pokemon: pokemon.TYPHLOSION,
      ingredientList: [
        { amount: 1, ingredient: ingredient.WARMING_GINGER },
        { amount: 2, ingredient: ingredient.FIERY_HERB },
      ],
    };
    const nat = nature.RASH;
    const level = 30;
    const subskills: subskill.SubSkill[] = [subskill.INGREDIENT_FINDER_M, subskill.INVENTORY_L];

    const ingredientsDropped = calculateProducePerMealWindow({
      pokemonCombination,
      customStats: { subskills, nature: nat, level },
      helpingBonus: 0,
    });
    expect(ingredientsDropped).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 0,
        "helpsBeforeSS": 13.539823008849558,
        "produce": {
          "berries": {
            "amount": 74.34756555523403,
            "berry": {
              "name": "LEPPA",
              "value": 27,
            },
          },
          "ingredients": [
            {
              "amount": 3.133250051213029,
              "ingredient": {
                "longName": "Warming Ginger",
                "name": "Ginger",
                "taxedValue": 34.7,
                "value": 109,
              },
            },
            {
              "amount": 6.266500102426058,
              "ingredient": {
                "longName": "Fiery Herb",
                "name": "Herb",
                "taxedValue": 49.4,
                "value": 130,
              },
            },
          ],
        },
        "sneakySnack": {
          "amount": 0,
          "berry": {
            "name": "LEPPA",
            "value": 27,
          },
        },
        "spilledIngredients": [],
      }
    `);
  });

  it('shall calculate optimal pokemon with large carry size at 30', () => {
    const pokemonCombination: PokemonIngredientSet = {
      pokemon: pokemon.TYRANITAR,
      ingredientList: [
        { amount: 2, ingredient: ingredient.WARMING_GINGER },
        { amount: 5, ingredient: ingredient.GREENGRASS_SOYBEANS },
      ],
    };
    const nat = nature.RASH;
    const level = 30;
    const subskills: subskill.SubSkill[] = [subskill.INGREDIENT_FINDER_M, subskill.INVENTORY_L];

    const ingredientsDropped = calculateProducePerMealWindow({
      pokemonCombination,
      customStats: { subskills, nature: nat, level },
      e4eProcs: 0,
    });
    expect(ingredientsDropped).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 0,
        "helpsBeforeSS": 12.033031852143138,
        "produce": {
          "berries": {
            "amount": 28.144855355772602,
            "berry": {
              "name": "WIKI",
              "value": 31,
            },
          },
          "ingredients": [
            {
              "amount": 7.1969597330244115,
              "ingredient": {
                "longName": "Warming Ginger",
                "name": "Ginger",
                "taxedValue": 34.7,
                "value": 109,
              },
            },
            {
              "amount": 17.992399332561032,
              "ingredient": {
                "longName": "Greengrass Soybeans",
                "name": "Soybean",
                "taxedValue": 29.2,
                "value": 100,
              },
            },
          ],
        },
        "sneakySnack": {
          "amount": 0,
          "berry": {
            "name": "WIKI",
            "value": 31,
          },
        },
        "spilledIngredients": [],
      }
    `);
  });

  it('shall calculate optimal pokemon with large carry size and small drops at 30', () => {
    const pokemonCombination: PokemonIngredientSet = {
      pokemon: pokemon.BLASTOISE,
      ingredientList: [
        { amount: 2, ingredient: ingredient.MOOMOO_MILK },
        { amount: 3, ingredient: ingredient.SOOTHING_CACAO },
      ],
    };
    const nat = nature.RASH;
    const level = 30;
    const subskills: subskill.SubSkill[] = [subskill.INGREDIENT_FINDER_M, subskill.INVENTORY_L];

    const ingredientsDropped = calculateProducePerMealWindow({
      pokemonCombination,
      customStats: { subskills, nature: nat, level },
    });
    expect(ingredientsDropped).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 0,
        "helpsBeforeSS": 11.604095563139932,
        "produce": {
          "berries": {
            "amount": 26.47766803867735,
            "berry": {
              "name": "ORAN",
              "value": 31,
            },
          },
          "ingredients": [
            {
              "amount": 7.167305480774793,
              "ingredient": {
                "longName": "Moomoo Milk",
                "name": "Milk",
                "taxedValue": 28.1,
                "value": 98,
              },
            },
            {
              "amount": 10.750958221162191,
              "ingredient": {
                "longName": "Soothing Cacao",
                "name": "Cacao",
                "taxedValue": 66.7,
                "value": 151,
              },
            },
          ],
        },
        "sneakySnack": {
          "amount": 0,
          "berry": {
            "name": "ORAN",
            "value": 31,
          },
        },
        "spilledIngredients": [],
      }
    `);
  });

  it('shall calculate optimal pokemon with medium carry size and medium drops at 30', () => {
    const pokemonCombination: PokemonIngredientSet = {
      pokemon: pokemon.DUGTRIO,
      ingredientList: [
        { amount: 2, ingredient: ingredient.SNOOZY_TOMATO },
        { amount: 3, ingredient: ingredient.LARGE_LEEK },
      ],
    };
    const nat = nature.RASH;
    const level = 30;
    const subskills: subskill.SubSkill[] = [subskill.INGREDIENT_FINDER_M, subskill.INVENTORY_L];

    const ingredientsDropped = calculateProducePerMealWindow({
      pokemonCombination,
      customStats: { subskills, nature: nat, level },
      e4eProcs: 0,
    });
    expect(ingredientsDropped).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 0,
        "helpsBeforeSS": 11.604095563139934,
        "produce": {
          "berries": {
            "amount": 33.13339599788191,
            "berry": {
              "name": "FIGY",
              "value": 29,
            },
          },
          "ingredients": [
            {
              "amount": 4.948729494373274,
              "ingredient": {
                "longName": "Snoozy Tomato",
                "name": "Tomato",
                "taxedValue": 35.4,
                "value": 110,
              },
            },
            {
              "amount": 7.4230942415599115,
              "ingredient": {
                "longName": "Large Leek",
                "name": "Leek",
                "taxedValue": 100.1,
                "value": 185,
              },
            },
          ],
        },
        "sneakySnack": {
          "amount": 0,
          "berry": {
            "name": "FIGY",
            "value": 29,
          },
        },
        "spilledIngredients": [],
      }
    `);
  });
});

describe('combineSameIngredientsInDrop', () => {
  it('shall combine ingredients and leave unique ingredients as is', () => {
    const pinsir: IngredientSet[] = [
      {
        amount: 2,
        ingredient: ingredient.HONEY,
      },
      { amount: 5, ingredient: ingredient.FANCY_APPLE },
    ];
    const absol: IngredientSet[] = [
      {
        amount: 2,
        ingredient: ingredient.SOOTHING_CACAO,
      },
      { amount: 8, ingredient: ingredient.FANCY_APPLE },
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

describe('calculatePercentageCoveredByCombination', () => {
  it('shall successfully calculate expected percentage', () => {
    const combination: IngredientSet[] = [
      { amount: 4, ingredient: ingredient.HONEY },
      { amount: 10, ingredient: ingredient.FANCY_APPLE },
    ];
    expect(calculatePercentageCoveredByCombination(recipe.LOVELY_KISS_SMOOTHIE, combination)).toMatchInlineSnapshot(
      `40`
    );
  });

  it('shall count no matching ingredients as zero percentage', () => {
    const combination: IngredientSet[] = [];
    expect(calculatePercentageCoveredByCombination(recipe.LOVELY_KISS_SMOOTHIE, combination)).toMatchInlineSnapshot(
      `0`
    );
  });

  it('shall limit overflow of ingredients at 100%', () => {
    const combination: IngredientSet[] = [
      { amount: 100, ingredient: ingredient.HONEY },
      { amount: 100, ingredient: ingredient.FANCY_APPLE },
      { amount: 100, ingredient: ingredient.SOOTHING_CACAO },
      { amount: 100, ingredient: ingredient.MOOMOO_MILK },
    ];
    expect(calculatePercentageCoveredByCombination(recipe.LOVELY_KISS_SMOOTHIE, combination)).toMatchInlineSnapshot(
      `100`
    );
  });

  it('shall handle combinations with same ingredient twice', () => {
    const raw = [
      { amount: 2.79, ingredient: { name: 'Apple', value: '90.00' } },
      { amount: 5.57, ingredient: { name: 'Apple', value: '90.00' } },
      { amount: 8.36, ingredient: { name: 'Soybeans', value: '100.00' } },
    ] as unknown as IngredientSet[];
    expect(calculatePercentageCoveredByCombination(recipe.FANCY_APPLE_CURRY, raw)).toBe(100);
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
        ingredient: ingredient.HONEY,
      },
      { amount: 5, ingredient: ingredient.FANCY_APPLE },
      { amount: 5, ingredient: ingredient.HONEY },
    ];
    const arr2: IngredientSet[] = [
      {
        amount: 1,
        ingredient: ingredient.HONEY,
      },
      { amount: 2.27, ingredient: ingredient.FANCY_APPLE },
      { amount: 4, ingredient: ingredient.HONEY },
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
    const meal = recipe.NINJA_SALAD;
    const producedIngredients: IngredientSet[] = [
      {
        amount: 4.7,
        ingredient: ingredient.SNOOZY_TOMATO,
      },
      {
        amount: 16.4,
        ingredient: ingredient.LARGE_LEEK,
      },
    ];

    const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);
    expect(contributedValue).toBe(9290.7);
    expect(fillerValue).toBe(306.51999999999987);
  });

  it('shall calculate contributed ingredient value correctly for leek/soy Dugtrio', () => {
    const meal = recipe.NINJA_SALAD;
    const producedIngredients: IngredientSet[] = [
      {
        amount: 4.4,
        ingredient: ingredient.SNOOZY_TOMATO,
      },
      {
        amount: 6.5,
        ingredient: ingredient.LARGE_LEEK,
      },
      {
        amount: 17.4,
        ingredient: ingredient.GREENGRASS_SOYBEANS,
      },
    ];

    const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);
    expect(contributedValue).toBe(9047.970000000001);
    expect(fillerValue).toBe(225.83999999999997);
  });
});

describe('calculateRemainingIngredients', () => {
  it('shall calculate remaining ingredients', () => {
    const recipe: IngredientSet[] = [
      {
        amount: 10,
        ingredient: ingredient.FANCY_APPLE,
      },
      { amount: 6, ingredient: ingredient.MOOMOO_MILK },
    ];
    const produce: IngredientSet[] = [
      {
        amount: 5,
        ingredient: ingredient.FANCY_APPLE,
      },
      { amount: 1, ingredient: ingredient.MOOMOO_MILK },
      { amount: 2, ingredient: ingredient.MOOMOO_MILK },
    ];

    const expectedRemaining: IngredientSet[] = [
      {
        amount: 5,
        ingredient: ingredient.FANCY_APPLE,
      },
      { amount: 3, ingredient: ingredient.MOOMOO_MILK },
    ];

    expect(calculateRemainingIngredients(recipe, produce)).toEqual(expectedRemaining);
  });
});

describe('sortByMinimumFiller', () => {
  it('shall sort OptimalTeamSolutions based on the minimum surplus of required ingredients', () => {
    const recipe = [
      { amount: 10, ingredient: ingredient.MOOMOO_MILK },
      { amount: 10, ingredient: ingredient.FANCY_APPLE },
    ];

    const teamSolutions: OptimalTeamSolution[] = [
      {
        team: [],
        surplus: extractRelevantSurplus(recipe, [
          { amount: 2, ingredient: ingredient.MOOMOO_MILK },
          { amount: 2, ingredient: ingredient.FANCY_APPLE },
        ]),
      },
      {
        team: [],
        surplus: extractRelevantSurplus(recipe, [
          { amount: 2, ingredient: ingredient.MOOMOO_MILK },
          { amount: 2, ingredient: ingredient.BEAN_SAUSAGE },
          { amount: 4, ingredient: ingredient.FANCY_APPLE },
        ]),
      },
      {
        team: [],
        surplus: extractRelevantSurplus(recipe, [{ amount: 3, ingredient: ingredient.MOOMOO_MILK }]),
      },
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
      { amount: 5, ingredient: FANCY_APPLE },
    ];

    const surplus = [
      { amount: 2, ingredient: MOOMOO_MILK },
      { amount: 3, ingredient: BEAN_SAUSAGE },
      { amount: 1, ingredient: FANCY_APPLE },
    ];

    const result = extractRelevantSurplus(recipe, surplus);

    expect(result.total).toEqual(surplus);
    expect(result.relevant).toEqual([
      { amount: 2, ingredient: MOOMOO_MILK },
      { amount: 1, ingredient: FANCY_APPLE },
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
