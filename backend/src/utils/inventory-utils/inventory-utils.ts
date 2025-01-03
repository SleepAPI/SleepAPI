import {
  calculateRibbonCarrySize,
  calculateSubskillCarrySize
} from '@src/services/calculator/stats/stats-calculator.js';
import type { Produce as Inventory } from 'sleepapi-common';

class InventoryUtilsImpl {
  // TODO: probably reimpl and move to flat-utils
  public addToInventory(currentInventory: Inventory, produce: Inventory): Inventory {
    const newInventory: Inventory = {
      berries: [...currentInventory.berries],
      ingredients: [...currentInventory.ingredients]
    };

    produce.berries.forEach((produceBerrySet) => {
      if (produceBerrySet.amount > 0) {
        const index = newInventory.berries.findIndex(
          (item) => item.berry.name === produceBerrySet.berry.name && item.level === produceBerrySet.level
        );

        if (index !== -1) {
          newInventory.berries[index] = {
            berry: newInventory.berries[index].berry,
            amount: newInventory.berries[index].amount + produceBerrySet.amount,
            level: newInventory.berries[index].level
          };
        } else {
          newInventory.berries.push({ ...produceBerrySet });
        }
      }
    });

    // TODO: seems like this might be significantly faster
    //   const result: IngredientSet[] = target;

    // for (const { amount, ingredient: addedIngredient } of toAdd) {
    //   const existingIngredient = result.find(({ ingredient }) => ingredient.name === addedIngredient.name);

    //   if (existingIngredient) {
    //     existingIngredient.amount += amount;
    //   } else {
    //     result.push({ ingredient: addedIngredient, amount });
    //   }
    // }

    // return result;
    produce.ingredients.forEach((produceIngredientSet) => {
      if (produceIngredientSet.amount > 0) {
        const index = newInventory.ingredients.findIndex(
          (item) => item.ingredient.name === produceIngredientSet.ingredient.name
        );

        if (index !== -1) {
          newInventory.ingredients[index] = {
            ingredient: newInventory.ingredients[index].ingredient,
            amount: newInventory.ingredients[index].amount + produceIngredientSet.amount
          };
        } else {
          newInventory.ingredients.push({ ...produceIngredientSet });
        }
      }
    });

    return newInventory;
  }

  public countInventory(inventory: Inventory) {
    return (
      inventory.berries.reduce((sum, cur) => sum + cur.amount, 0) +
      inventory.ingredients.reduce((sum, cur) => sum + cur.amount, 0)
    );
  }

  public getEmptyInventory(): Inventory {
    return {
      berries: [],
      ingredients: []
    };
  }

  public calculateCarrySize(params: {
    baseWithEvolutions: number;
    subskillsLevelLimited: Set<string>;
    level: number;
    ribbon: number;
    camp: boolean;
  }) {
    const { baseWithEvolutions, subskillsLevelLimited, ribbon, camp } = params;
    return Math.ceil(
      (baseWithEvolutions + calculateSubskillCarrySize(subskillsLevelLimited) + calculateRibbonCarrySize(ribbon)) *
        (camp ? 1.2 : 1)
    );
  }
}

export const InventoryUtils = new InventoryUtilsImpl();
