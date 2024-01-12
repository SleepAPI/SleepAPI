import { PokemonCombination } from '../../../domain/combination/combination';
import { TYPHLOSION } from '../../../domain/pokemon/berry-pokemon';
import { ABSOL, BLASTOISE, DUGTRIO, PINSIR, TYRANITAR } from '../../../domain/pokemon/ingredient-pokemon';
import {
  FANCY_APPLE,
  FIERY_HERB,
  GREENGRASS_SOYBEANS,
  HONEY,
  IngredientDrop,
  LARGE_LEEK,
  MOOMOO_MILK,
  SNOOZY_TOMATO,
  SOOTHING_CACAO,
  WARMING_GINGER,
} from '../../../domain/produce/ingredient';
import { FANCY_APPLE_CURRY } from '../../../domain/recipe/curry';
import { LOVELY_KISS_SMOOTHIE } from '../../../domain/recipe/dessert';
import { NINJA_SALAD } from '../../../domain/recipe/salad';
import { BASHFUL, RASH } from '../../../domain/stat/nature';
import { HELPING_SPEED_M, INGREDIENT_FINDER_M, INVENTORY_L, SubSkill } from '../../../domain/stat/subskill';
import {
  calculateContributedIngredientsValue,
  calculatePercentageCoveredByCombination,
  calculateProducePerMealWindow,
  combineIngredientDrops,
  combineSameIngredientsInDrop,
  getAllIngredientCombinationsForLevel,
} from './ingredient-calculate';

describe('calculateIngredientsProducedPerMeal', () => {
  it('shall calculate realistic Pinsir at 30', () => {
    const pokemonCombination: PokemonCombination = {
      pokemon: PINSIR,
      ingredientList: [
        { amount: 2, ingredient: HONEY },
        { amount: 5, ingredient: FANCY_APPLE },
      ],
    };
    const nature = BASHFUL;
    const level = 30;
    const subskills: SubSkill[] = [HELPING_SPEED_M];

    const ingredientsDropped = calculateProducePerMealWindow({
      pokemonCombination,
      customStats: { subskills, nature, level },
    });
    expect(ingredientsDropped).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 16.324600547446963,
        "helpsBeforeSS": 12.543323980854927,
        "produce": {
          "berries": {
            "amount": 48.29177814067094,
            "berry": {
              "name": "LUM",
              "value": 24,
            },
          },
          "ingredients": [
            {
              "amount": 4.1738140113185365,
              "ingredient": {
                "longName": "Honey",
                "name": "Honey",
                "taxedValue": 29.8,
                "value": 101,
              },
            },
            {
              "amount": 10.43453502829634,
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
          "amount": 16.324600547446963,
          "berry": {
            "name": "LUM",
            "value": 24,
          },
        },
        "spilledIngredients": [
          {
            "amount": 3.3612352527193297,
            "ingredient": {
              "longName": "Honey",
              "name": "Honey",
              "taxedValue": 29.8,
              "value": 101,
            },
          },
          {
            "amount": 8.403088131798325,
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
    const pokemonCombination: PokemonCombination = {
      pokemon: ABSOL,
      ingredientList: [
        { amount: 2, ingredient: SOOTHING_CACAO },
        { amount: 8, ingredient: FANCY_APPLE },
      ],
    };
    const nature = RASH;
    const level = 30;
    const subskills: SubSkill[] = [INGREDIENT_FINDER_M, INVENTORY_L];

    const ingredientsDropped = calculateProducePerMealWindow({
      pokemonCombination,
      customStats: { subskills, nature, level },
      helpingBonus: 0,
      e4eProcs: 0,
    });
    expect(ingredientsDropped).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 2.3711954607170416,
        "helpsBeforeSS": 14.810163326481163,
        "produce": {
          "berries": {
            "amount": 33.31554602338643,
            "berry": {
              "name": "WIKI",
              "value": 31,
            },
          },
          "ingredients": [
            {
              "amount": 4.539656544900318,
              "ingredient": {
                "longName": "Soothing Cacao",
                "name": "Cacao",
                "taxedValue": 66.7,
                "value": 151,
              },
            },
            {
              "amount": 18.15862617960127,
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
          "amount": 2.3711954607170416,
          "berry": {
            "name": "WIKI",
            "value": 31,
          },
        },
        "spilledIngredients": [
          {
            "amount": 0.6880488383580797,
            "ingredient": {
              "longName": "Soothing Cacao",
              "name": "Cacao",
              "taxedValue": 66.7,
              "value": 151,
            },
          },
          {
            "amount": 2.752195353432319,
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

  it('shall calculate optimal berry specialist at 30', () => {
    const pokemonCombination: PokemonCombination = {
      pokemon: TYPHLOSION,
      ingredientList: [
        { amount: 1, ingredient: WARMING_GINGER },
        { amount: 2, ingredient: FIERY_HERB },
      ],
    };
    const nature = RASH;
    const level = 30;
    const subskills: SubSkill[] = [INGREDIENT_FINDER_M, INVENTORY_L];

    const ingredientsDropped = calculateProducePerMealWindow({
      pokemonCombination,
      customStats: { subskills, nature, level },
      helpingBonus: 0,
    });
    expect(ingredientsDropped).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 0,
        "helpsBeforeSS": 23.98119122257053,
        "produce": {
          "berries": {
            "amount": 87.00034237348858,
            "berry": {
              "name": "LEPPA",
              "value": 27,
            },
          },
          "ingredients": [
            {
              "amount": 3.6664795297805637,
              "ingredient": {
                "longName": "Warming Ginger",
                "name": "Ginger",
                "taxedValue": 34.7,
                "value": 109,
              },
            },
            {
              "amount": 7.332959059561127,
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
    const pokemonCombination: PokemonCombination = {
      pokemon: TYRANITAR,
      ingredientList: [
        { amount: 2, ingredient: WARMING_GINGER },
        { amount: 5, ingredient: GREENGRASS_SOYBEANS },
      ],
    };
    const nature = RASH;
    const level = 30;
    const subskills: SubSkill[] = [INGREDIENT_FINDER_M, INVENTORY_L];

    const ingredientsDropped = calculateProducePerMealWindow({
      pokemonCombination,
      customStats: { subskills, nature, level },
      e4eProcs: 0,
    });
    expect(ingredientsDropped).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 0,
        "helpsBeforeSS": 20.633850303438972,
        "produce": {
          "berries": {
            "amount": 32.546607170135744,
            "berry": {
              "name": "WIKI",
              "value": 31,
            },
          },
          "ingredients": [
            {
              "amount": 8.32253775296052,
              "ingredient": {
                "longName": "Warming Ginger",
                "name": "Ginger",
                "taxedValue": 34.7,
                "value": 109,
              },
            },
            {
              "amount": 20.806344382401296,
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
    const pokemonCombination: PokemonCombination = {
      pokemon: BLASTOISE,
      ingredientList: [
        { amount: 2, ingredient: MOOMOO_MILK },
        { amount: 3, ingredient: SOOTHING_CACAO },
      ],
    };
    const nature = RASH;
    const level = 30;
    const subskills: SubSkill[] = [INGREDIENT_FINDER_M, INVENTORY_L];

    const ingredientsDropped = calculateProducePerMealWindow({
      pokemonCombination,
      customStats: { subskills, nature, level },
    });
    expect(ingredientsDropped).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 0,
        "helpsBeforeSS": 19.678456591639872,
        "produce": {
          "berries": {
            "amount": 30.485733893675494,
            "berry": {
              "name": "ORAN",
              "value": 31,
            },
          },
          "ingredients": [
            {
              "amount": 8.252258745083092,
              "ingredient": {
                "longName": "Moomoo Milk",
                "name": "Milk",
                "taxedValue": 28.1,
                "value": 98,
              },
            },
            {
              "amount": 12.378388117624638,
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
    const pokemonCombination: PokemonCombination = {
      pokemon: DUGTRIO,
      ingredientList: [
        { amount: 2, ingredient: SNOOZY_TOMATO },
        { amount: 3, ingredient: LARGE_LEEK },
      ],
    };
    const nature = RASH;
    const level = 30;
    const subskills: SubSkill[] = [INGREDIENT_FINDER_M, INVENTORY_L];

    const ingredientsDropped = calculateProducePerMealWindow({
      pokemonCombination,
      customStats: { subskills, nature, level },
      e4eProcs: 0,
    });
    expect(ingredientsDropped).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 0,
        "helpsBeforeSS": 19.678456591639872,
        "produce": {
          "berries": {
            "amount": 38.14897489875994,
            "berry": {
              "name": "FIGY",
              "value": 29,
            },
          },
          "ingredients": [
            {
              "amount": 5.6978450767216104,
              "ingredient": {
                "longName": "Snoozy Tomato",
                "name": "Tomato",
                "taxedValue": 35.4,
                "value": 110,
              },
            },
            {
              "amount": 8.546767615082416,
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
    const pinsir: IngredientDrop[] = [
      {
        amount: 2,
        ingredient: HONEY,
      },
      { amount: 5, ingredient: FANCY_APPLE },
    ];
    const absol: IngredientDrop[] = [
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

describe('calculatePercentageCoveredByCombination', () => {
  it('shall successfully calculate expected percentage', () => {
    const combination: IngredientDrop[] = [
      { amount: 4, ingredient: HONEY },
      { amount: 10, ingredient: FANCY_APPLE },
    ];
    expect(calculatePercentageCoveredByCombination(LOVELY_KISS_SMOOTHIE, combination)).toMatchInlineSnapshot(`40`);
  });

  it('shall count no matching ingredients as zero percentage', () => {
    const combination: IngredientDrop[] = [];
    expect(calculatePercentageCoveredByCombination(LOVELY_KISS_SMOOTHIE, combination)).toMatchInlineSnapshot(`0`);
  });

  it('shall limit overflow of ingredients at 100%', () => {
    const combination: IngredientDrop[] = [
      { amount: 100, ingredient: HONEY },
      { amount: 100, ingredient: FANCY_APPLE },
      { amount: 100, ingredient: SOOTHING_CACAO },
      { amount: 100, ingredient: MOOMOO_MILK },
    ];
    expect(calculatePercentageCoveredByCombination(LOVELY_KISS_SMOOTHIE, combination)).toMatchInlineSnapshot(`100`);
  });

  it('shall handle combinations with same ingredient twice', () => {
    const raw = [
      { amount: 2.79, ingredient: { name: 'Apple', value: '90.00' } },
      { amount: 5.57, ingredient: { name: 'Apple', value: '90.00' } },
      { amount: 8.36, ingredient: { name: 'Soybeans', value: '100.00' } },
    ] as unknown as IngredientDrop[];
    expect(calculatePercentageCoveredByCombination(FANCY_APPLE_CURRY, raw)).toBe(100);
  });
});

describe('getAllIngredientCombinationsFor', () => {
  it('shall find all combinations for given pokemon at level 60', () => {
    expect(getAllIngredientCombinationsForLevel(PINSIR, 60)).toMatchInlineSnapshot(`
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
    expect(getAllIngredientCombinationsForLevel(PINSIR, 30)).toMatchInlineSnapshot(`
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
    const arr1: IngredientDrop[] = [
      {
        amount: 1.1,
        ingredient: HONEY,
      },
      { amount: 5, ingredient: FANCY_APPLE },
      { amount: 5, ingredient: HONEY },
    ];
    const arr2: IngredientDrop[] = [
      {
        amount: 1,
        ingredient: HONEY,
      },
      { amount: 2.27, ingredient: FANCY_APPLE },
      { amount: 4, ingredient: HONEY },
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
    const meal = NINJA_SALAD;
    const producedIngredients: IngredientDrop[] = [
      {
        amount: 4.7,
        ingredient: SNOOZY_TOMATO,
      },
      {
        amount: 16.4,
        ingredient: LARGE_LEEK,
      },
    ];

    const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);
    expect(contributedValue).toBe(9290.7);
    expect(fillerValue).toBe(306.51999999999987);
  });

  it('shall calculate contributed ingredient value correctly for leek/soy Dugtrio', () => {
    const meal = NINJA_SALAD;
    const producedIngredients: IngredientDrop[] = [
      {
        amount: 4.4,
        ingredient: SNOOZY_TOMATO,
      },
      {
        amount: 6.5,
        ingredient: LARGE_LEEK,
      },
      {
        amount: 17.4,
        ingredient: GREENGRASS_SOYBEANS,
      },
    ];

    const { contributedValue, fillerValue } = calculateContributedIngredientsValue(meal, producedIngredients);
    expect(contributedValue).toBe(9047.970000000001);
    expect(fillerValue).toBe(225.83999999999997);
  });
});
