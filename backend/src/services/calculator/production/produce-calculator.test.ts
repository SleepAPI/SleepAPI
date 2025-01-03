import { calculateAverageProduce, clampHelp } from '@src/services/calculator/production/produce-calculator.js';
import { describe, expect, it } from 'bun:test';
import type { PokemonIngredientSet, Produce } from 'sleepapi-common';
import { emptyBerryInventory, ingredient, pokemon } from 'sleepapi-common';

describe('calculateAverageProduce', () => {
  it('shall average a Pokemons produce based on ingredient percentage', () => {
    const averagePokemonCombination: PokemonIngredientSet = {
      pokemon: pokemon.PINSIR,
      ingredientList: [{ amount: 1, ingredient: ingredient.FANCY_APPLE }]
    };
    const ingredientPercentage = 0.5;
    const berriesPerDrop = 1;

    expect(calculateAverageProduce(averagePokemonCombination, ingredientPercentage, berriesPerDrop, 60))
      .toMatchInlineSnapshot(`
{
  "berries": [
    {
      "amount": 0.5,
      "berry": {
        "name": "LUM",
        "type": "bug",
        "value": 24,
      },
      "level": 60,
    },
  ],
  "ingredients": [
    {
      "amount": 0.5,
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
