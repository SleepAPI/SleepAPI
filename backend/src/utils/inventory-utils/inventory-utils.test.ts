import { Produce } from '@src/domain/combination/produce';
import { InventoryUtils } from '@src/utils/inventory-utils/inventory-utils';
import { prettifyIngredientDrop } from '@src/utils/json/json-utils';
import { berry, ingredient } from 'sleepapi-common';

describe('emptyInventory', () => {
  it('shall empty inventory', () => {
    let inventory: Produce = {
      berries: {
        amount: 2,
        berry: berry.LEPPA,
      },
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    inventory = InventoryUtils.getEmptyInventory();
    expect(inventory.berries).toBeUndefined();
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

    expect(InventoryUtils.countInventory(inventory)).toBe(4);
  });

  it('shall count inventory size and ignore berries if no berries', () => {
    const inventory: Produce = {
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    expect(InventoryUtils.countInventory(inventory)).toBe(2);
  });

  it('shall count inventory size and ignore ingredients if no ingredients', () => {
    const inventory: Produce = {
      berries: {
        amount: 2,
        berry: berry.LEPPA,
      },
      ingredients: [],
    };

    expect(InventoryUtils.countInventory(inventory)).toBe(2);
  });

  it('shall count size as 0 if empty', () => {
    expect(InventoryUtils.countInventory(InventoryUtils.getEmptyInventory())).toBe(0);
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

    inventory = InventoryUtils.addToInventory(inventory, inventory);
    expect(InventoryUtils.countInventory(inventory)).toBe(8);
  });

  it('shall add produce to empty inventory', () => {
    let inventory = InventoryUtils.getEmptyInventory();

    const addedProduce = {
      berries: {
        amount: 2,
        berry: berry.LEPPA,
      },
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    inventory = InventoryUtils.addToInventory(inventory, addedProduce);
    expect(InventoryUtils.countInventory(inventory)).toBe(4);
    expect(inventory).toMatchInlineSnapshot(`
      {
        "berries": {
          "amount": 2,
          "berry": {
            "name": "LEPPA",
            "type": "fire",
            "value": 27,
          },
        },
        "ingredients": [
          {
            "amount": 2,
            "ingredient": {
              "longName": "Snoozy Tomato",
              "name": "Tomato",
              "taxedValue": 35.4,
              "value": 110,
            },
          },
        ],
      }
    `);
  });

  it('shall add empty produce to inventory', () => {
    let inventory: Produce = {
      berries: {
        amount: 2,
        berry: berry.LEPPA,
      },
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    inventory = InventoryUtils.addToInventory(inventory, InventoryUtils.getEmptyInventory());
    expect(InventoryUtils.countInventory(inventory)).toBe(4);
  });

  it('shall add produce without berries to inventory', () => {
    let inventory: Produce = {
      berries: {
        amount: 2,
        berry: berry.LEPPA,
      },
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    const added: Produce = {
      ingredients: [{ amount: 2, ingredient: ingredient.TASTY_MUSHROOM }],
    };

    inventory = InventoryUtils.addToInventory(inventory, added);
    expect(inventory.berries?.amount).toBe(2);
    expect(prettifyIngredientDrop(inventory.ingredients)).toMatchInlineSnapshot(`"2 Tomato, 2 Mushroom"`);
  });

  it('shall add produce without berries to inventory without berries', () => {
    let inventory: Produce = {
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    const added: Produce = {
      ingredients: [{ amount: 2, ingredient: ingredient.TASTY_MUSHROOM }],
    };

    inventory = InventoryUtils.addToInventory(inventory, added);
    expect(inventory.berries).toBeUndefined();
    expect(prettifyIngredientDrop(inventory.ingredients)).toMatchInlineSnapshot(`"2 Tomato, 2 Mushroom"`);
  });
});
