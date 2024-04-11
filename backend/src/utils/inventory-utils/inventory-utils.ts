import { Produce as Inventory } from '@src/domain/combination/produce';

export function addToInventory(currentInventory: Inventory, produce: Inventory): Inventory {
  const newInventory: Inventory = {
    berries: {
      amount: currentInventory.berries.amount + produce.berries.amount,
      berry: currentInventory.berries.berry,
    },
    ingredients: [...currentInventory.ingredients],
  };

  produce.ingredients.forEach((produceIngredientSet) => {
    const index = newInventory.ingredients.findIndex(
      (item) => item.ingredient.name === produceIngredientSet.ingredient.name
    );

    if (index !== -1) {
      newInventory.ingredients[index] = {
        ingredient: newInventory.ingredients[index].ingredient,
        amount: newInventory.ingredients[index].amount + produceIngredientSet.amount,
      };
    } else {
      newInventory.ingredients.push({ ...produceIngredientSet });
    }
  });

  return newInventory;
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
