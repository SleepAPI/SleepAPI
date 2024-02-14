import { Produce as Inventory } from '@src/domain/combination/produce';

export function addToInventory(currentInventory: Inventory, produce: Inventory): Inventory {
  currentInventory.berries.amount += produce.berries.amount;

  produce.ingredients.forEach((produceIngredientSet) => {
    const { ingredient, amount } = produceIngredientSet;

    const currentIngredientSet = currentInventory.ingredients.find((item) => item.ingredient.name === ingredient.name);

    if (currentIngredientSet) {
      currentIngredientSet.amount += amount;
    } else {
      currentInventory.ingredients.push({ ...produceIngredientSet });
    }
  });

  return currentInventory;
}

export function emptyInventory(inventory: Inventory): Inventory {
  return {
    berries: {
      amount: 0,
      berry: inventory.berries.berry,
    },
    ingredients: [],
  };
}

export function countInventory(inventory: Inventory) {
  return inventory.berries.amount + inventory.ingredients.reduce((sum, cur) => sum + cur.amount, 0);
}
