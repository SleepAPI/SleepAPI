import { calculateRibbonCarrySize, calculateSubskillCarrySize } from '@src/services/calculator/stats/stats-calculator';
import { limitSubSkillsToLevel } from '@src/utils/subskill-utils/subskill-utils';
import { Produce as Inventory, subskill } from 'sleepapi-common';

class InventoryUtilsImpl {
  public addToInventory(currentInventory: Inventory, produce: Inventory): Inventory {
    const newInventory: Inventory = {
      berries: [...currentInventory.berries],
      ingredients: [...currentInventory.ingredients],
    };

    produce.berries.forEach((produceBerrySet) => {
      const index = newInventory.berries.findIndex(
        (item) => item.berry.name === produceBerrySet.berry.name && item.level === produceBerrySet.level
      );

      if (index !== -1) {
        newInventory.berries[index] = {
          berry: newInventory.berries[index].berry,
          amount: newInventory.berries[index].amount + produceBerrySet.amount,
          level: newInventory.berries[index].level,
        };
      } else {
        newInventory.berries.push({ ...produceBerrySet });
      }
    });

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
    return (
      inventory.berries.reduce((sum, cur) => sum + cur.amount, 0) +
      inventory.ingredients.reduce((sum, cur) => sum + cur.amount, 0)
    );
  }

  public getEmptyInventory(): Inventory {
    return {
      berries: [],
      ingredients: [],
    };
  }

  public calculateCarrySize(params: {
    baseWithEvolutions: number;
    subskills: subskill.SubSkill[];
    level: number;
    ribbon: number;
    camp: boolean;
  }) {
    const { baseWithEvolutions, subskills, level, ribbon, camp } = params;
    return Math.ceil(
      (baseWithEvolutions +
        calculateSubskillCarrySize(limitSubSkillsToLevel(subskills, level)) +
        calculateRibbonCarrySize(ribbon)) *
        (camp ? 1.2 : 1)
    );
  }
}

export const InventoryUtils = new InventoryUtilsImpl();
