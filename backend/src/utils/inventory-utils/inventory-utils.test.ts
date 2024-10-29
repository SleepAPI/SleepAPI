import { InventoryUtils } from '@src/utils/inventory-utils/inventory-utils';
import { Produce, berry, emptyBerryInventory, ingredient, prettifyIngredientDrop, subskill } from 'sleepapi-common';

describe('emptyInventory', () => {
  it('shall empty inventory', () => {
    let inventory: Produce = {
      berries: [
        {
          amount: 2,
          berry: berry.LEPPA,
          level: 60,
        },
      ],
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    inventory = InventoryUtils.getEmptyInventory();
    expect(inventory.berries).toEqual([]);
    expect(inventory.ingredients).toEqual([]);
  });
});

describe('countInventory', () => {
  it('shall count inventory size correctly', () => {
    const inventory: Produce = {
      berries: [
        {
          amount: 2,
          berry: berry.LEPPA,
          level: 60,
        },
      ],
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    expect(InventoryUtils.countInventory(inventory)).toBe(4);
  });

  it('shall count inventory size and ignore berries if no berries', () => {
    const inventory: Produce = {
      berries: emptyBerryInventory(),
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    expect(InventoryUtils.countInventory(inventory)).toBe(2);
  });

  it('shall count inventory size and ignore ingredients if no ingredients', () => {
    const inventory: Produce = {
      berries: [
        {
          amount: 2,
          berry: berry.LEPPA,
          level: 60,
        },
      ],
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
      berries: [
        {
          amount: 2,
          berry: berry.LEPPA,
          level: 60,
        },
      ],
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    inventory = InventoryUtils.addToInventory(inventory, inventory);
    expect(InventoryUtils.countInventory(inventory)).toBe(8);
  });

  it('shall add produce to empty inventory', () => {
    let inventory = InventoryUtils.getEmptyInventory();

    const addedProduce: Produce = {
      berries: [
        {
          amount: 2,
          berry: berry.LEPPA,
          level: 60,
        },
      ],
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    inventory = InventoryUtils.addToInventory(inventory, addedProduce);
    expect(InventoryUtils.countInventory(inventory)).toBe(4);
    expect(inventory).toMatchInlineSnapshot(`
      {
        "berries": [
          {
            "amount": 2,
            "berry": {
              "name": "LEPPA",
              "type": "fire",
              "value": 27,
            },
            "level": 60,
          },
        ],
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
      berries: [
        {
          amount: 2,
          berry: berry.LEPPA,
          level: 60,
        },
      ],
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    inventory = InventoryUtils.addToInventory(inventory, InventoryUtils.getEmptyInventory());
    expect(InventoryUtils.countInventory(inventory)).toBe(4);
  });

  it('shall add produce without berries to inventory', () => {
    let inventory: Produce = {
      berries: [
        {
          amount: 2,
          berry: berry.LEPPA,
          level: 60,
        },
      ],
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    const added: Produce = {
      berries: emptyBerryInventory(),
      ingredients: [{ amount: 2, ingredient: ingredient.TASTY_MUSHROOM }],
    };

    inventory = InventoryUtils.addToInventory(inventory, added);
    expect(inventory.berries.reduce((sum, cur) => sum + cur.amount, 0)).toBe(2);
    expect(prettifyIngredientDrop(inventory.ingredients)).toMatchInlineSnapshot(`"2 Tomato, 2 Mushroom"`);
  });

  it('shall add produce without berries to inventory without berries', () => {
    let inventory: Produce = {
      berries: emptyBerryInventory(),
      ingredients: [{ amount: 2, ingredient: ingredient.SNOOZY_TOMATO }],
    };

    const added: Produce = {
      berries: emptyBerryInventory(),
      ingredients: [{ amount: 2, ingredient: ingredient.TASTY_MUSHROOM }],
    };

    inventory = InventoryUtils.addToInventory(inventory, added);
    expect(inventory.berries).toEqual([]);
    expect(prettifyIngredientDrop(inventory.ingredients)).toMatchInlineSnapshot(`"2 Tomato, 2 Mushroom"`);
  });
});

describe('calculateCarrySize', () => {
  it('shall give same for default', () => {
    const baseWithEvolutions = 10;
    const subskills: subskill.SubSkill[] = [];
    const level = 10;
    const ribbon = 0;
    const camp = false;
    expect(InventoryUtils.calculateCarrySize({ baseWithEvolutions, subskills, level, ribbon, camp })).toBe(10);
  });

  it('shall give correct for subskills, ribbon and camp', () => {
    const baseWithEvolutions = 31;
    const subskills: subskill.SubSkill[] = [subskill.INVENTORY_S];
    const level = 54;
    const ribbon = 2;
    const camp = true;
    expect(InventoryUtils.calculateCarrySize({ baseWithEvolutions, subskills, level, ribbon, camp })).toBe(48);
  });
});
