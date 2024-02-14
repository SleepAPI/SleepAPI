import { Produce } from '@src/domain/combination/produce';
import { berry, ingredient } from 'sleepapi-common';
import { addToInventory, countInventory, emptyInventory } from './inventory-utils';

describe('emptyInventory', () => {
  it('shall empty inventory', () => {
    let inventory: Produce = {
      berries: {
        amount: 2,
        berry: berry.LEPPA,
      },
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    inventory = emptyInventory(inventory);
    expect(inventory.berries.amount).toBe(0);
    expect(inventory.ingredients).toEqual([]);
  });
});

describe('countInventory', () => {
  it('shall count inventory size correctly', () => {
    const inventory: Produce = {
      berries: {
        amount: 2,
        berry: berry.LEPPA,
      },
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    expect(countInventory(inventory)).toBe(4);
  });
});

describe('addToInventory', () => {
  it('shall add produce to inventory', () => {
    let inventory: Produce = {
      berries: {
        amount: 2,
        berry: berry.LEPPA,
      },
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    inventory = addToInventory(inventory, inventory);
    expect(countInventory(inventory)).toBe(8);
  });
});
