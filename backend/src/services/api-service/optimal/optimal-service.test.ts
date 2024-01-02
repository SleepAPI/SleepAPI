import { RAICHU } from '../../../domain/pokemon/berry-pokemon';
import { ABSOL, TYRANITAR } from '../../../domain/pokemon/ingredient-pokemon';
import {
  BEAN_SAUSAGE,
  FANCY_APPLE,
  FANCY_EGG,
  GREENGRASS_SOYBEANS,
  SOOTHING_CACAO,
  TASTY_MUSHROOM,
  WARMING_GINGER,
} from '../../../domain/produce/ingredient';
import { NINJA_CURRY } from '../../../domain/recipe/curry';
import { LOVELY_KISS_SMOOTHIE, NEROLIS_RESTORATIVE_TEA } from '../../../domain/recipe/dessert';
import { NINJA_SALAD } from '../../../domain/recipe/salad';
import { OptimalTeamForMeal, findIntersections, hashOptimalTeamsForMeal } from './optimal-service';

describe('hashOptimalTeamsForMeal', () => {
  it('shall hash the OptimalTeamForMeal correctly', () => {
    const data = createOptimalTeams();
    const hash = hashOptimalTeamsForMeal(data);

    const keys = Object.keys(hash);

    expect(keys).toHaveLength(3);

    const key1 = keys[0];
    const key2 = keys[1];
    const key3 = keys[2];

    expect(key1).toMatchInlineSnapshot(
      `"ABSOL(2 Cacao / 8 Apple / 7 Mushroom),RAICHU(1 Apple / 2 Ginger / 3 Egg),TYRANITAR(2 Ginger / 5 Soybean / 8 Sausage)"`
    );
    expect(hash[key1]).toMatchInlineSnapshot(`
      {
        "count": 2,
        "meals": [
          "NEROLIS_RESTORATIVE_TEA",
          "LOVELY_KISS_SMOOTHIE",
        ],
      }
    `);

    expect(key2).toMatchInlineSnapshot(
      `"ABSOL(2 Cacao / 8 Apple / 7 Mushroom),RAICHU(1 Apple / 2 Ginger / 3 Egg),TYRANITAR(2 Ginger / 5 Soybean / 7 Ginger)"`
    );
    expect(hash[key2]).toMatchInlineSnapshot(`
      {
        "count": 1,
        "meals": [
          "NEROLIS_RESTORATIVE_TEA",
        ],
      }
    `);

    expect(key3).toMatchInlineSnapshot(`"ABSOL(2 Cacao / 8 Apple / 7 Mushroom),RAICHU(1 Apple / 2 Ginger / 3 Egg)"`);
    expect(hash[key3]).toMatchInlineSnapshot(`
      {
        "count": 2,
        "meals": [
          "NINJA_CURRY",
          "NINJA_SALAD",
        ],
      }
    `);
  });
});

// TODO: add test for 2x Golem NINJA_SALAD issue, identify and debug
describe('findIntersections', () => {
  it('shall find all intersections', () => {
    const data = createOptimalTeams();
    const hash = hashOptimalTeamsForMeal(data);

    const intersections = findIntersections(hash);
    expect(Object.keys(hash)).toMatchInlineSnapshot(`
      [
        "ABSOL(2 Cacao / 8 Apple / 7 Mushroom),RAICHU(1 Apple / 2 Ginger / 3 Egg),TYRANITAR(2 Ginger / 5 Soybean / 8 Sausage)",
        "ABSOL(2 Cacao / 8 Apple / 7 Mushroom),RAICHU(1 Apple / 2 Ginger / 3 Egg),TYRANITAR(2 Ginger / 5 Soybean / 7 Ginger)",
        "ABSOL(2 Cacao / 8 Apple / 7 Mushroom),RAICHU(1 Apple / 2 Ginger / 3 Egg)",
      ]
    `);

    expect(intersections).toMatchInlineSnapshot(`
      [
        {
          "countedMeals": [
            "NEROLIS_RESTORATIVE_TEA",
            "NINJA_CURRY",
            "NINJA_SALAD",
          ],
          "meals": [
            "NEROLIS_RESTORATIVE_TEA",
            "LOVELY_KISS_SMOOTHIE",
            "NINJA_CURRY",
            "NINJA_SALAD",
          ],
          "pokemonCombinations": [
            "ABSOL(2 Cacao / 8 Apple / 7 Mushroom)",
            "RAICHU(1 Apple / 2 Ginger / 3 Egg)",
          ],
          "score": 52871,
        },
        {
          "countedMeals": [
            "NEROLIS_RESTORATIVE_TEA",
          ],
          "meals": [
            "NEROLIS_RESTORATIVE_TEA",
            "LOVELY_KISS_SMOOTHIE",
          ],
          "pokemonCombinations": [
            "ABSOL(2 Cacao / 8 Apple / 7 Mushroom)",
            "RAICHU(1 Apple / 2 Ginger / 3 Egg)",
            "TYRANITAR(2 Ginger / 5 Soybean / 8 Sausage)",
          ],
          "score": 12561,
        },
      ]
    `);
  });
});

function createOptimalTeams(): OptimalTeamForMeal[] {
  const team1: OptimalTeamForMeal = {
    meal: NEROLIS_RESTORATIVE_TEA,
    pokemonCombinations: [
      {
        pokemon: ABSOL,
        ingredientList: [
          {
            amount: 2,
            ingredient: SOOTHING_CACAO,
          },
          { amount: 8, ingredient: FANCY_APPLE },
          { amount: 7, ingredient: TASTY_MUSHROOM },
        ],
      },
      {
        pokemon: TYRANITAR,
        ingredientList: [
          {
            amount: 2,
            ingredient: WARMING_GINGER,
          },
          { amount: 5, ingredient: GREENGRASS_SOYBEANS },
          { amount: 8, ingredient: BEAN_SAUSAGE },
        ],
      },
      {
        pokemon: RAICHU,
        ingredientList: [
          {
            amount: 1,
            ingredient: FANCY_APPLE,
          },
          { amount: 2, ingredient: WARMING_GINGER },
          { amount: 3, ingredient: FANCY_EGG },
        ],
      },
    ],
  };

  const team2: OptimalTeamForMeal = {
    meal: NEROLIS_RESTORATIVE_TEA,
    pokemonCombinations: [
      {
        pokemon: ABSOL,
        ingredientList: [
          {
            amount: 2,
            ingredient: SOOTHING_CACAO,
          },
          { amount: 8, ingredient: FANCY_APPLE },
          { amount: 7, ingredient: TASTY_MUSHROOM },
        ],
      },
      {
        pokemon: TYRANITAR,
        ingredientList: [
          {
            amount: 2,
            ingredient: WARMING_GINGER,
          },
          { amount: 5, ingredient: GREENGRASS_SOYBEANS },
          { amount: 7, ingredient: WARMING_GINGER },
        ],
      },
      {
        pokemon: RAICHU,
        ingredientList: [
          {
            amount: 1,
            ingredient: FANCY_APPLE,
          },
          { amount: 2, ingredient: WARMING_GINGER },
          { amount: 3, ingredient: FANCY_EGG },
        ],
      },
    ],
  };

  const team3 = {
    meal: NINJA_CURRY,
    pokemonCombinations: [
      {
        pokemon: RAICHU,
        ingredientList: [
          {
            amount: 1,
            ingredient: FANCY_APPLE,
          },
          { amount: 2, ingredient: WARMING_GINGER },
          { amount: 3, ingredient: FANCY_EGG },
        ],
      },
      {
        pokemon: ABSOL,
        ingredientList: [
          {
            amount: 2,
            ingredient: SOOTHING_CACAO,
          },
          { amount: 8, ingredient: FANCY_APPLE },
          { amount: 7, ingredient: TASTY_MUSHROOM },
        ],
      },
    ],
  };

  const team4 = {
    meal: LOVELY_KISS_SMOOTHIE,
    pokemonCombinations: [
      {
        pokemon: ABSOL,
        ingredientList: [
          {
            amount: 2,
            ingredient: SOOTHING_CACAO,
          },
          { amount: 8, ingredient: FANCY_APPLE },
          { amount: 7, ingredient: TASTY_MUSHROOM },
        ],
      },
      {
        pokemon: TYRANITAR,
        ingredientList: [
          {
            amount: 2,
            ingredient: WARMING_GINGER,
          },
          { amount: 5, ingredient: GREENGRASS_SOYBEANS },
          { amount: 8, ingredient: BEAN_SAUSAGE },
        ],
      },
      {
        pokemon: RAICHU,
        ingredientList: [
          {
            amount: 1,
            ingredient: FANCY_APPLE,
          },
          { amount: 2, ingredient: WARMING_GINGER },
          { amount: 3, ingredient: FANCY_EGG },
        ],
      },
    ],
  };
  const team5 = {
    meal: NINJA_SALAD,
    pokemonCombinations: [
      {
        pokemon: ABSOL,
        ingredientList: [
          {
            amount: 2,
            ingredient: SOOTHING_CACAO,
          },
          { amount: 8, ingredient: FANCY_APPLE },
          { amount: 7, ingredient: TASTY_MUSHROOM },
        ],
      },
      {
        pokemon: RAICHU,
        ingredientList: [
          {
            amount: 1,
            ingredient: FANCY_APPLE,
          },
          { amount: 2, ingredient: WARMING_GINGER },
          { amount: 3, ingredient: FANCY_EGG },
        ],
      },
    ],
  };

  return [team1, team2, team3, team4, team5];
}
