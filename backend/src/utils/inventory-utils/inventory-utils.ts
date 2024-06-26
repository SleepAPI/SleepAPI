import { Produce as Inventory } from '@src/domain/combination/produce';

class InventoryUtilsImpl {
  public addToInventory(currentInventory: Inventory, produce: Inventory): Inventory {
    const newInventory: Inventory = {
      berries: currentInventory.berries
        ? {
            amount: currentInventory.berries.amount + (produce.berries?.amount ?? 0),
            berry: currentInventory.berries.berry,
          }
        : produce.berries,
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

  public countInventory(inventory: Inventory) {
    return (inventory.berries?.amount ?? 0) + inventory.ingredients.reduce((sum, cur) => sum + cur.amount, 0);
  }

  public getEmptyInventory(): Inventory {
    return {
      ingredients: [],
    };
  }
}

export const InventoryUtils = new InventoryUtilsImpl();
