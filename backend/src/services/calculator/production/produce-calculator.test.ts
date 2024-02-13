import { Produce } from '@src/domain/combination/produce';
import { roundDown } from '@src/utils/calculator-utils/calculator-utils';
import { BerrySet, IngredientSet, PokemonIngredientSet, ingredient, nature, pokemon, subskill } from 'sleepapi-common';
import { combineSameIngredientsInDrop } from '../ingredient/ingredient-calculate';
import { extractIngredientSubskills } from '../stats/stats-calculator';
import {
  calculateAverageProduce,
  calculateNightlyProduce,
  calculateProduceForSpecificTimeWindow,
} from './produce-calculator';

describe('calculateProduceInTimeWindow', () => {
  it('shall calculate level 30 combination for ingredient specialist', () => {
    const combination: IngredientSet[] = [];
    combination.push({ amount: 2 / 2, ingredient: ingredient.MOOMOO_MILK });
    combination.push({ amount: 3 / 2, ingredient: ingredient.SOOTHING_CACAO });

    const pkmn = pokemon.BLASTOISE;
    const subskills = [subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_M];

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pkmn.ingredientPercentage / 100) * nature.RASH.ingredient * ingredientSubskills;

    const calculatedProduce = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: { ingredientList: combination, pokemon: pkmn },
      ingredientPercentage,
      customStats: { level: 30, nature: nature.RASH, subskills },
      energyPeriod: 'CUSTOM',
      e4eProcs: 10,
      timeWindow: 6,
    });
    expect(combineSameIngredientsInDrop(calculatedProduce.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 9.504,
          "ingredient": {
            "longName": "Moomoo Milk",
            "name": "Milk",
            "taxedValue": 28.1,
            "value": 98,
          },
        },
        {
          "amount": 14.256,
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
    const combination: IngredientSet[] = [];
    combination.push({ amount: 1 / 2, ingredient: ingredient.FANCY_APPLE });
    combination.push({ amount: 2 / 2, ingredient: ingredient.FANCY_APPLE });

    const pkmn = pokemon.RAICHU;
    const subskills = [subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_M];

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pkmn.ingredientPercentage / 100) * nature.RASH.ingredient * ingredientSubskills;

    const calculatedProduce = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: { ingredientList: combination, pokemon: pkmn },
      ingredientPercentage,
      customStats: { level: 30, nature: nature.RASH, subskills },
      energyPeriod: 'CUSTOM',
      e4eProcs: 10,
      timeWindow: 6,
    });
    expect(combineSameIngredientsInDrop(calculatedProduce.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 14.787020224719104,
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
        "amount": 34.21655730337079,
        "berry": {
          "name": "GREPA",
          "value": 25,
        },
      }
    `);
  });

  it('shall calculate level 30 combination for skill specialist', () => {
    const combination: IngredientSet[] = [];
    combination.push({ amount: 1 / 2, ingredient: ingredient.SOOTHING_CACAO });
    combination.push({ amount: 2 / 2, ingredient: ingredient.FANCY_APPLE });

    const pkmn = pokemon.GOLDUCK;
    const subskills = [subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_M];

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pkmn.ingredientPercentage / 100) * nature.RASH.ingredient * ingredientSubskills;

    const calculatedIngredients = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: { ingredientList: combination, pokemon: pkmn },
      ingredientPercentage: ingredientPercentage,
      customStats: { level: 30, nature: nature.RASH, subskills },
      energyPeriod: 'CUSTOM',
      e4eProcs: 10,
      timeWindow: 6,
    });
    expect(combineSameIngredientsInDrop(calculatedIngredients.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 1.9204648910411624,
          "ingredient": {
            "longName": "Soothing Cacao",
            "name": "Cacao",
            "taxedValue": 66.7,
            "value": 151,
          },
        },
        {
          "amount": 3.8409297820823247,
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
    const combination: IngredientSet[] = [];
    combination.push({ amount: 2 / 3, ingredient: ingredient.GREENGRASS_SOYBEANS });
    combination.push({ amount: 5 / 3, ingredient: ingredient.GREENGRASS_SOYBEANS });
    combination.push({ amount: 7 / 3, ingredient: ingredient.GREENGRASS_SOYBEANS });

    const pkmn = pokemon.GOLEM;
    const subskills = [subskill.HELPING_SPEED_M, subskill.INGREDIENT_FINDER_M];

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pkmn.ingredientPercentage / 100) * nature.RASH.ingredient * ingredientSubskills;
    const calculatedIngredients = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: { ingredientList: combination, pokemon: pkmn },
      ingredientPercentage,
      customStats: { level: 30, nature: nature.RASH, subskills },
      energyPeriod: 'CUSTOM',
      e4eProcs: 10,
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
    const pkmn = pokemon.PINSIR;
    const pokemonCombination: PokemonIngredientSet = {
      pokemon: pkmn,
      ingredientList: [
        { amount: 2 / 2, ingredient: ingredient.HONEY },
        { amount: 5 / 2, ingredient: ingredient.FANCY_APPLE },
      ],
    };
    const nat = nature.BASHFUL;
    const level = 30;
    const subskills = [subskill.HELPING_SPEED_M];
    const timeWindow = 6;

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pkmn.ingredientPercentage / 100) * nat.ingredient * ingredientSubskills;

    const calculatedProduce = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: pokemonCombination,
      ingredientPercentage,
      customStats: { subskills, nature: nat, level },
      timeWindow,
      energyPeriod: 'CUSTOM',
      e4eProcs: 10,
    });
    expect(combineSameIngredientsInDrop(calculatedProduce.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 5.0910755148741424,
          "ingredient": {
            "longName": "Honey",
            "name": "Honey",
            "taxedValue": 29.8,
            "value": 101,
          },
        },
        {
          "amount": 12.727688787185356,
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
    const pkmn = pokemon.TYPHLOSION;
    const pokemonCombination: PokemonIngredientSet = {
      pokemon: pkmn,
      ingredientList: [
        { amount: 1 / 2, ingredient: ingredient.WARMING_GINGER },
        { amount: 2 / 2, ingredient: ingredient.FIERY_HERB },
      ],
    };
    const level = 35;
    const subskills = [subskill.HELPING_SPEED_M];
    const timeWindow = 6;
    const nat = nature.JOLLY;

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pkmn.ingredientPercentage / 100) * nat.ingredient * ingredientSubskills;

    const calculatedProduce = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: pokemonCombination,
      ingredientPercentage,
      customStats: { subskills, nature: nat, level },
      timeWindow,
      energyPeriod: 'CUSTOM',
      e4eProcs: 10,
    });
    expect(combineSameIngredientsInDrop(calculatedProduce.ingredients)).toMatchInlineSnapshot(`
      [
        {
          "amount": 2.0775953757225434,
          "ingredient": {
            "longName": "Warming Ginger",
            "name": "Ginger",
            "taxedValue": 34.7,
            "value": 109,
          },
        },
        {
          "amount": 4.155190751445087,
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
    const pkmn = pokemon.AMPHAROS;
    const pokemonCombination: PokemonIngredientSet = {
      pokemon: pkmn,
      ingredientList: [
        { amount: 1 / 2, ingredient: ingredient.FIERY_HERB },
        { amount: 3 / 2, ingredient: ingredient.FANCY_EGG },
      ],
    };

    const level = 30;
    const subskills = [subskill.HELPING_SPEED_M];
    const timeWindow = 6;
    const nat = nature.BASHFUL;

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pkmn.ingredientPercentage / 100) * nat.ingredient * ingredientSubskills;

    const calculatedProduce = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: pokemonCombination,
      ingredientPercentage,
      customStats: { level, nature: nat, subskills },
      energyPeriod: 'CUSTOM',
      e4eProcs: 10,
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
    const pkmn = pokemon.VICTREEBEL;
    const pokemonCombination: PokemonIngredientSet = {
      pokemon: pkmn,
      ingredientList: [
        { amount: 2 / 2, ingredient: ingredient.SNOOZY_TOMATO },
        { amount: 4 / 2, ingredient: ingredient.SOFT_POTATO },
      ],
    };
    const level = 30;
    const subskills = [subskill.HELPING_SPEED_M];
    const timeWindow = 6;
    const nat = nature.BASHFUL;

    const ingredientSubskills = extractIngredientSubskills(subskills);
    const ingredientPercentage = (pkmn.ingredientPercentage / 100) * nat.ingredient * ingredientSubskills;

    const calculatedProduce = calculateProduceForSpecificTimeWindow({
      averagedPokemonCombination: pokemonCombination,
      ingredientPercentage,
      customStats: { level, nature: nat, subskills },
      energyPeriod: 'CUSTOM',
      e4eProcs: 10,
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
    const pkmn = pokemon.VICTREEBEL;
    const ingredients: IngredientSet[] = [
      { amount: 6, ingredient: ingredient.SNOOZY_TOMATO },
      { amount: 15.2, ingredient: ingredient.SNOOZY_TOMATO },
      { amount: 18.9, ingredient: ingredient.SOFT_POTATO },
    ];
    const berries: BerrySet = {
      amount: 8,
      berry: pkmn.berry,
    };
    const produce: Produce = {
      berries,
      ingredients,
    };

    const averageIngredientDrop: IngredientSet[] = [
      { amount: 2 / 3, ingredient: ingredient.SNOOZY_TOMATO },
      { amount: 5 / 3, ingredient: ingredient.SNOOZY_TOMATO },
      { amount: 6 / 3, ingredient: ingredient.SOFT_POTATO },
    ];
    const averagePokemonCombination: PokemonIngredientSet = {
      pokemon: pkmn,
      ingredientList: averageIngredientDrop,
    };

    const averageProduce = calculateAverageProduce(averagePokemonCombination, 0.4, 1);

    const result = calculateNightlyProduce(pkmn.maxCarrySize, averageProduce, produce, 1);
    expect(
      roundDown(
        result.produce.ingredients.reduce((sum, { amount }) => sum + amount, 0) + result.produce.berries.amount,
        1
      )
    ).toBe(pkmn.maxCarrySize);
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
