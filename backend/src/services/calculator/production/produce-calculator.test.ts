import { PokemonCombination } from '../../../domain/combination/combination';
import { RAICHU, TYPHLOSION } from '../../../domain/pokemon/berry-pokemon';
import { BLASTOISE, GOLEM, PINSIR, VICTREEBEL } from '../../../domain/pokemon/ingredient-pokemon';
import { AMPHAROS, GOLDUCK } from '../../../domain/pokemon/skill-pokemon';
import { BerryDrop } from '../../../domain/produce/berry';
import {
  FANCY_APPLE,
  FANCY_EGG,
  FIERY_HERB,
  GREENGRASS_SOYBEANS,
  HONEY,
  IngredientDrop,
  MOOMOO_MILK,
  SNOOZY_TOMATO,
  SOFT_POTATO,
  SOOTHING_CACAO,
  WARMING_GINGER,
} from '../../../domain/produce/ingredient';
import { Produce } from '../../../domain/produce/produce';
import { BASHFUL, JOLLY, RASH } from '../../../domain/stat/nature';
import { HELPING_SPEED_M, INGREDIENT_FINDER_M } from '../../../domain/stat/subskill';
import { roundDown } from '../../../utils/calculator-utils/calculator-utils';
import { combineSameIngredientsInDrop } from '../ingredient/ingredient-calculate';
import { extractIngredientSubskills } from '../stats/stats-calculator';
import {
  calculateAverageProduce,
  calculateNightlyProduce,
  calculateProduceForSpecificTimeWindow,
} from './produce-calculator';

describe('calculateProduceInTimeWindow', () => {
  it('shall calculate level 30 combination for ingredient specialist', () => {
    const combination: IngredientDrop[] = [];
    combination.push({ amount: 2 / 2, ingredient: MOOMOO_MILK });
    combination.push({ amount: 3 / 2, ingredient: SOOTHING_CACAO });

    const pokemon = BLASTOISE;
    const subskills = [HELPING_SPEED_M, INGREDIENT_FINDER_M];

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pokemon.ingredientPercentage / 100) * RASH.ingredient * ingredientSubskills;

    const calculatedProduce = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: { ingredientList: combination, pokemon },
      ingredientPercentage,
      customStats: { level: 30, nature: RASH, subskills },
      energyPeriod: 'CUSTOM',
      customEnergyFactor: 0.45,
      timeWindow: 6,
    });
    expect(combineSameIngredientsInDrop(calculatedProduce.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 9.490176,
          "ingredient": {
            "longName": "Moomoo Milk",
            "name": "Milk",
            "taxedValue": 28.1,
            "value": 98,
          },
        },
        {
          "amount": 14.235264,
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

  it('shall calculate level 30 combination for berry specialist', () => {
    const combination: IngredientDrop[] = [];
    combination.push({ amount: 1 / 2, ingredient: FANCY_APPLE });
    combination.push({ amount: 2 / 2, ingredient: FANCY_APPLE });

    const pokemon = RAICHU;
    const subskills = [HELPING_SPEED_M, INGREDIENT_FINDER_M];

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pokemon.ingredientPercentage / 100) * RASH.ingredient * ingredientSubskills;

    const calculatedProduce = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: { ingredientList: combination, pokemon },
      ingredientPercentage,
      customStats: { level: 30, nature: RASH, subskills },
      energyPeriod: 'CUSTOM',
      customEnergyFactor: 0.45,
      timeWindow: 6,
    });
    expect(combineSameIngredientsInDrop(calculatedProduce.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 14.800222921348315,
          "ingredient": {
            "longName": "Fancy Apple",
            "name": "Apple",
            "taxedValue": 23.7,
            "value": 90,
          },
        },
      ]
    `);
    expect(calculatedProduce.berries).toMatchInlineSnapshot(`
      {
        "amount": 34.19895370786517,
        "berry": {
          "name": "GREPA",
          "value": 25,
        },
      }
    `);
  });

  it('shall calculate level 30 combination for skill specialist', () => {
    const combination: IngredientDrop[] = [];
    combination.push({ amount: 1 / 2, ingredient: SOOTHING_CACAO });
    combination.push({ amount: 2 / 2, ingredient: FANCY_APPLE });

    const pokemon = GOLDUCK;
    const subskills = [HELPING_SPEED_M, INGREDIENT_FINDER_M];

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pokemon.ingredientPercentage / 100) * RASH.ingredient * ingredientSubskills;

    const calculatedIngredients = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: { ingredientList: combination, pokemon },
      ingredientPercentage: ingredientPercentage,
      customStats: { level: 30, nature: RASH, subskills },
      energyPeriod: 'CUSTOM',
      customEnergyFactor: 0.45,
      timeWindow: 6,
    });
    expect(combineSameIngredientsInDrop(calculatedIngredients.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 1.904816658595642,
          "ingredient": {
            "longName": "Soothing Cacao",
            "name": "Cacao",
            "taxedValue": 66.7,
            "value": 151,
          },
        },
        {
          "amount": 3.809633317191284,
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

  it('shall calculate level 60 golem with triple same roll', () => {
    const combination: IngredientDrop[] = [];
    combination.push({ amount: 2 / 3, ingredient: GREENGRASS_SOYBEANS });
    combination.push({ amount: 5 / 3, ingredient: GREENGRASS_SOYBEANS });
    combination.push({ amount: 7 / 3, ingredient: GREENGRASS_SOYBEANS });

    const pokemon = GOLEM;
    const subskills = [HELPING_SPEED_M, INGREDIENT_FINDER_M];

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pokemon.ingredientPercentage / 100) * RASH.ingredient * ingredientSubskills;
    const calculatedIngredients = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: { ingredientList: combination, pokemon },
      ingredientPercentage,
      customStats: { level: 30, nature: RASH, subskills },
      energyPeriod: 'CUSTOM',
      customEnergyFactor: 0.45,
      timeWindow: 6,
    });
    expect(combineSameIngredientsInDrop(calculatedIngredients.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 40.76244955752213,
          "ingredient": {
            "longName": "Greengrass Soybeans",
            "name": "Soybean",
            "taxedValue": 29.2,
            "value": 100,
          },
        },
      ]
    `);
  });

  it('shall calculate realistic Pinsir at 30', () => {
    const pokemon = PINSIR;
    const pokemonCombination: PokemonCombination = {
      pokemon,
      ingredientList: [
        { amount: 2 / 2, ingredient: HONEY },
        { amount: 5 / 2, ingredient: FANCY_APPLE },
      ],
    };
    const nature = BASHFUL;
    const level = 30;
    const subskills = [HELPING_SPEED_M];
    const timeWindow = 6;

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pokemon.ingredientPercentage / 100) * nature.ingredient * ingredientSubskills;

    const calculatedProduce = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: pokemonCombination,
      ingredientPercentage,
      customStats: { subskills, nature, level },
      timeWindow,
      energyPeriod: 'CUSTOM',
      customEnergyFactor: 0.45,
    });
    expect(combineSameIngredientsInDrop(calculatedProduce.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 5.0886041189931355,
          "ingredient": {
            "longName": "Honey",
            "name": "Honey",
            "taxedValue": 29.8,
            "value": 101,
          },
        },
        {
          "amount": 12.721510297482839,
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

  it('shall calculate wa3vs Typhlosion', () => {
    const pokemon = TYPHLOSION;
    const pokemonCombination: PokemonCombination = {
      pokemon,
      ingredientList: [
        { amount: 1 / 2, ingredient: WARMING_GINGER },
        { amount: 2 / 2, ingredient: FIERY_HERB },
      ],
    };
    const level = 35;
    const subskills = [HELPING_SPEED_M];
    const timeWindow = 6;
    const nature = JOLLY;

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pokemon.ingredientPercentage / 100) * nature.ingredient * ingredientSubskills;

    const calculatedProduce = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: pokemonCombination,
      ingredientPercentage,
      customStats: { subskills, nature, level },
      timeWindow,
      energyPeriod: 'CUSTOM',
      customEnergyFactor: 0.45,
    });
    expect(combineSameIngredientsInDrop(calculatedProduce.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 2.055620809248555,
          "ingredient": {
            "longName": "Warming Ginger",
            "name": "Ginger",
            "taxedValue": 34.7,
            "value": 109,
          },
        },
        {
          "amount": 4.11124161849711,
          "ingredient": {
            "longName": "Fiery Herb",
            "name": "Herb",
            "taxedValue": 49.4,
            "value": 130,
          },
        },
      ]
    `);
  });

  it('shall calculate wa3vs Lemon', () => {
    const pokemon = AMPHAROS;
    const pokemonCombination: PokemonCombination = {
      pokemon,
      ingredientList: [
        { amount: 1 / 2, ingredient: FIERY_HERB },
        { amount: 3 / 2, ingredient: FANCY_EGG },
      ],
    };

    const level = 30;
    const subskills = [HELPING_SPEED_M];
    const timeWindow = 6;
    const nature = BASHFUL;

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pokemon.ingredientPercentage / 100) * nature.ingredient * ingredientSubskills;

    const calculatedProduce = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: pokemonCombination,
      ingredientPercentage,
      customStats: { level, nature, subskills },
      energyPeriod: 'CUSTOM',
      customEnergyFactor: 0.45,
      timeWindow,
    });
    expect(combineSameIngredientsInDrop(calculatedProduce.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 1.5411635565312845,
          "ingredient": {
            "longName": "Fiery Herb",
            "name": "Herb",
            "taxedValue": 49.4,
            "value": 130,
          },
        },
        {
          "amount": 4.623490669593854,
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

  it('shall calculate Wallowers Victreebel', () => {
    const pokemon = VICTREEBEL;
    const pokemonCombination: PokemonCombination = {
      pokemon,
      ingredientList: [
        { amount: 2 / 2, ingredient: SNOOZY_TOMATO },
        { amount: 4 / 2, ingredient: SOFT_POTATO },
      ],
    };
    const level = 30;
    const subskills = [HELPING_SPEED_M];
    const timeWindow = 6;
    const nature = BASHFUL;

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pokemon.ingredientPercentage / 100) * nature.ingredient * ingredientSubskills;

    const calculatedProduce = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: pokemonCombination,
      ingredientPercentage,
      customStats: { level, nature, subskills },
      energyPeriod: 'CUSTOM',
      customEnergyFactor: 0.45,
      timeWindow,
    });
    expect(combineSameIngredientsInDrop(calculatedProduce.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 4.934117647058824,
          "ingredient": {
            "longName": "Snoozy Tomato",
            "name": "Tomato",
            "taxedValue": 35.4,
            "value": 110,
          },
        },
        {
          "amount": 9.868235294117648,
          "ingredient": {
            "longName": "Soft Potato",
            "name": "Potato",
            "taxedValue": 45,
            "value": 124,
          },
        },
      ]
    `);
  });
});

describe('calculateNightlyProduce', () => {
  it('shall correctly clamp produce to carry size', () => {
    const pokemon = VICTREEBEL;
    const ingredients: IngredientDrop[] = [
      { amount: 6, ingredient: SNOOZY_TOMATO },
      { amount: 15.2, ingredient: SNOOZY_TOMATO },
      { amount: 18.9, ingredient: SOFT_POTATO },
    ];
    const berries: BerryDrop = {
      amount: 8,
      berry: pokemon.berry,
    };
    const produce: Produce = {
      berries,
      ingredients,
    };

    const averageIngredientDrop: IngredientDrop[] = [
      { amount: 2 / 3, ingredient: SNOOZY_TOMATO },
      { amount: 5 / 3, ingredient: SNOOZY_TOMATO },
      { amount: 6 / 3, ingredient: SOFT_POTATO },
    ];
    const averagePokemonCombination: PokemonCombination = {
      pokemon,
      ingredientList: averageIngredientDrop,
    };

    const averageProduce = calculateAverageProduce(averagePokemonCombination, 0.4, 1);

    const result = calculateNightlyProduce(pokemon.maxCarrySize, averageProduce, produce, 1);
    expect(
      roundDown(
        result.produce.ingredients.reduce((sum, { amount }) => sum + amount, 0) + result.produce.berries.amount,
        1
      )
    ).toBe(pokemon.maxCarrySize);
    expect(result).toMatchInlineSnapshot(`
      {
        "helpsAfterSS": 9.04285714285714,
        "helpsBeforeSS": 11.571428571428571,
        "produce": {
          "berries": {
            "amount": 4.490644490644491,
            "berry": {
              "name": "DURIN",
              "value": 30,
            },
          },
          "ingredients": [
            {
              "amount": 3.3679833679833684,
              "ingredient": {
                "longName": "Snoozy Tomato",
                "name": "Tomato",
                "taxedValue": 35.4,
                "value": 110,
              },
            },
            {
              "amount": 8.532224532224532,
              "ingredient": {
                "longName": "Snoozy Tomato",
                "name": "Tomato",
                "taxedValue": 35.4,
                "value": 110,
              },
            },
            {
              "amount": 10.60914760914761,
              "ingredient": {
                "longName": "Soft Potato",
                "name": "Potato",
                "taxedValue": 45,
                "value": 124,
              },
            },
          ],
        },
        "sneakySnack": {
          "amount": 9.04285714285714,
          "berry": {
            "name": "DURIN",
            "value": 30,
          },
        },
        "spilledIngredients": [
          {
            "amount": 2.4114285714285706,
            "ingredient": {
              "longName": "Snoozy Tomato",
              "name": "Tomato",
              "taxedValue": 35.4,
              "value": 110,
            },
          },
          {
            "amount": 6.028571428571427,
            "ingredient": {
              "longName": "Snoozy Tomato",
              "name": "Tomato",
              "taxedValue": 35.4,
              "value": 110,
            },
          },
          {
            "amount": 7.234285714285711,
            "ingredient": {
              "longName": "Soft Potato",
              "name": "Potato",
              "taxedValue": 45,
              "value": 124,
            },
          },
        ],
      }
    `);
  });
});
