import { describe, expect, it } from 'bun:test';
import type { PokemonWithIngredients, Produce } from 'sleepapi-common';
import {
  berry,
  berrySetToFlat,
  emptyBerryInventory,
  ingredient,
  ingredientSetToFloatFlat,
  PINSIR
} from 'sleepapi-common';
import { calculateAverageProduce, clampHelp } from './produce-calculator.js';

describe('calculateAverageProduce', () => {
  it('shall average a Pokemons produce based on ingredient percentage', () => {
    const averagePokemonCombination: PokemonWithIngredients = {
      pokemon: PINSIR,
      ingredientList: [{ amount: 1, ingredient: ingredient.FANCY_APPLE }]
    };
    const ingredientPercentage = 0.5;
    const berriesPerDrop = 1;

    expect(
      calculateAverageProduce({
        ingredients: ingredientSetToFloatFlat(averagePokemonCombination.ingredientList),
        berries: berrySetToFlat([{ amount: 1, berry: berry.LUM, level: 60 }]),
        ingredientPercentage,
        berriesPerDrop
      })
    ).toMatchInlineSnapshot(`
{
  "berries": Float32Array [
    0,
    0.5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ],
  "ingredients": Float32Array [
    0.5,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ],
}
`);
  });
});

describe('clampHelp', () => {
  it('shall clamp help if not enough space left in inventory', () => {
    const produce: Produce = {
      berries: emptyBerryInventory(),
      ingredients: [{ amount: 2, ingredient: ingredient.BEAN_SAUSAGE }]
    };
    const result = clampHelp({ amount: 2, averageProduce: produce, inventorySpace: 1 });
    expect(result).toMatchInlineSnapshot(`
{
  "berries": [],
  "ingredients": [
    {
      "amount": 1,
      "ingredient": {
        "longName": "Bean Sausage",
        "name": "Sausage",
        "taxedValue": 31,
        "value": 103,
      },
    },
  ],
}
`);
  });

  it('shall not clamp help if space left in inventory', () => {
    const produce: Produce = {
      berries: emptyBerryInventory(),
      ingredients: [{ amount: 1, ingredient: ingredient.BEAN_SAUSAGE }]
    };
    const result = clampHelp({ amount: 1, averageProduce: produce, inventorySpace: 2 });
    expect(result).toMatchInlineSnapshot(`
{
  "berries": [],
  "ingredients": [
    {
      "amount": 1,
      "ingredient": {
        "longName": "Bean Sausage",
        "name": "Sausage",
        "taxedValue": 31,
        "value": 103,
      },
    },
  ],
}
`);
  });
});
