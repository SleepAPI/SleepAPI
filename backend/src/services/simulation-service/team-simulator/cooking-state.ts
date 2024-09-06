import { rollRandomChance } from '@src/utils/simulation-utils/simulation-utils';
import { CookingResult, IngredientSet, MAX_POT_SIZE, Recipe, curry, dessert, salad } from 'sleepapi-common';

interface CookedRecipe extends Recipe {
  extraTasty: boolean;
  sunday: boolean;
  nrOfFiller: number;
  strength: number;
}
// TODO: if we need more performance we can track current day in cookingState and only cook/add ings every %2 days or something

// TODO: fillers, should increase weekly strength, but should also be passed alone to frontend so we can show filler value
export class CookingState {
  private camp;
  private bonusPotSize = 0;
  private bonusCritChance = 0;

  private cookedCurries: CookedRecipe[] = [];
  private curryFillers: IngredientSet[] = [];

  private cookedSalads: CookedRecipe[] = [];
  private saladFillers: IngredientSet[] = [];

  private cookedDesserts: CookedRecipe[] = [];
  private dessertFillers: IngredientSet[] = [];

  private allCurries: Recipe[] = curry.CURRIES.sort((a, b) => b.valueMax - a.valueMax);
  private allSalads: Recipe[] = salad.SALADS.sort((a, b) => b.valueMax - a.valueMax);
  private allDesserts: Recipe[] = dessert.DESSERTS.sort((a, b) => b.valueMax - a.valueMax);

  private currentCurryInventory: IngredientSet[] = [];
  private currentSaladInventory: IngredientSet[] = [];
  private currentDessertInventory: IngredientSet[] = [];

  constructor(camp: boolean) {
    this.camp = camp;
  }

  public addIngredients(ingredients: IngredientSet[]) {
    this.addIngredientsToInventory(this.currentCurryInventory, ingredients);
    this.addIngredientsToInventory(this.currentSaladInventory, ingredients);
    this.addIngredientsToInventory(this.currentDessertInventory, ingredients);
  }

  public cook(sunday: boolean) {
    const potLimitedCurries = this.allCurries.filter((r) => r.nrOfIngredients <= this.currentPotSize(sunday));
    const cookedCurry =
      this.cookRecipeType({
        availableRecipes: potLimitedCurries,
        currentIngredients: this.currentCurryInventory,
      }) ?? curry.MIXED_CURRY;

    const potLimitedSalads = this.allSalads.filter((r) => r.nrOfIngredients <= this.currentPotSize(sunday));
    const cookedSalad =
      this.cookRecipeType({
        availableRecipes: potLimitedSalads,
        currentIngredients: this.currentSaladInventory,
      }) ?? salad.MIXED_SALAD;

    const potLimitedDesserts = this.allDesserts.filter((r) => r.nrOfIngredients <= this.currentPotSize(sunday));
    const cookedDessert =
      this.cookRecipeType({
        availableRecipes: potLimitedDesserts,
        currentIngredients: this.currentDessertInventory,
      }) ?? dessert.MIXED_JUICE;

    const extraTasty = rollRandomChance(this.currentCritChance(sunday));
    if (extraTasty) {
      this.bonusCritChance = 0;
    }
    const extraTastyFactor = extraTasty ? (sunday ? 3 : 2) : 1;

    this.cookedCurries.push({
      ...cookedCurry,
      sunday,
      strength: cookedCurry.valueMax * extraTastyFactor,
      extraTasty,
      nrOfFiller: this.currentPotSize(sunday) - cookedCurry.nrOfIngredients,
    });
    this.cookedSalads.push({
      ...cookedSalad,
      sunday,
      strength: cookedSalad.valueMax * extraTastyFactor,
      extraTasty,
      nrOfFiller: this.currentPotSize(sunday) - cookedSalad.nrOfIngredients,
    });

    this.cookedDesserts.push({
      ...cookedDessert,
      sunday,
      strength: cookedDessert.valueMax * extraTastyFactor,
      extraTasty,
      nrOfFiller: this.currentPotSize(sunday) - cookedDessert.nrOfIngredients,
    });

    this.bonusPotSize = 0;
  }

  public addCritBonus(amount: number) {
    this.bonusCritChance = Math.min(0.7, this.bonusCritChance + amount);
  }

  public addPotSize(amount: number) {
    this.bonusPotSize = Math.min(200, this.bonusPotSize + amount);
  }

  private currentCritChance(sunday: boolean) {
    return (sunday ? 0.3 : 0.1) + this.bonusCritChance;
  }

  private currentPotSize(sunday: boolean): number {
    const basePotSize = MAX_POT_SIZE * (sunday ? 2 : 1);
    const potSizeWithCPU = basePotSize + this.bonusPotSize;
    return Math.round(this.camp ? potSizeWithCPU * 1.5 : potSizeWithCPU);
  }

  public results(days: number): CookingResult {
    // TODO: calc fillers, iterate recipes and don't forget about checking if crit and if sunday (2x or 3x, or 1x base)

    const nrOfWeeks = Math.max(days / 7, 1);
    return {
      curry: {
        weeklyStrength: this.cookedCurries.reduce((sum, cur) => sum + cur.strength, 0) / nrOfWeeks,
        sundayStrength: this.cookedCurries.reduce((sum, cur) => sum + (cur.sunday ? cur.strength : 0), 0) / nrOfWeeks,
        cookedRecipes: this.groupAndCountCookedRecipes(this.cookedCurries),
      },
      salad: {
        weeklyStrength: this.cookedSalads.reduce((sum, cur) => sum + cur.strength, 0) / nrOfWeeks,
        sundayStrength: this.cookedSalads.reduce((sum, cur) => sum + (cur.sunday ? cur.strength : 0), 0) / nrOfWeeks,
        cookedRecipes: this.groupAndCountCookedRecipes(this.cookedSalads),
      },
      dessert: {
        weeklyStrength: this.cookedDesserts.reduce((sum, cur) => sum + cur.strength, 0) / nrOfWeeks,
        sundayStrength: this.cookedDesserts.reduce((sum, cur) => sum + (cur.sunday ? cur.strength : 0), 0) / nrOfWeeks,
        cookedRecipes: this.groupAndCountCookedRecipes(this.cookedDesserts),
      },
    };
  }

  private groupAndCountCookedRecipes(cookedRecipes: CookedRecipe[]) {
    const recipeCounts = new Map<string, { recipe: Recipe; count: number; sunday: number }>();

    for (const recipe of cookedRecipes) {
      const recipeName = recipe.name;
      const currentEntry = recipeCounts.get(recipeName);
      const sunday = recipe.sunday ? 1 : 0;

      if (currentEntry) {
        currentEntry.count += 1;
        currentEntry.sunday += sunday;
      } else {
        recipeCounts.set(recipeName, { recipe, count: 1, sunday });
      }
    }

    return Array.from(recipeCounts.values());
  }

  private addIngredientsToInventory(inventory: IngredientSet[], ingredientSets: IngredientSet[]) {
    for (const { ingredient, amount } of ingredientSets) {
      const ingredientName = ingredient.name;
      const existingIngredientSet = inventory.find((set) => set.ingredient.name === ingredientName);

      if (existingIngredientSet) {
        existingIngredientSet.amount += amount;
      } else {
        inventory.push({ ingredient, amount });
      }
    }
  }

  private removeIngredientsFromInventory(inventory: IngredientSet[], ingredientSets: IngredientSet[]) {
    for (const { ingredient, amount } of ingredientSets) {
      const ingredientName = ingredient.name;
      const existingIngredientSet = inventory.find((set) => set.ingredient.name === ingredientName);

      if (existingIngredientSet) {
        existingIngredientSet.amount -= amount;

        if (existingIngredientSet.amount <= 0) {
          const index = inventory.indexOf(existingIngredientSet);
          if (index > -1) {
            inventory.splice(index, 1);
          }
        }
      }
    }
  }

  private cookRecipeType(params: {
    availableRecipes: Recipe[];
    currentIngredients: IngredientSet[];
  }): Recipe | undefined {
    const { availableRecipes, currentIngredients } = params;
    for (const recipe of availableRecipes) {
      let canCook = true;
      for (const requiredSet of recipe.ingredients) {
        const availableSet = currentIngredients.find((set) => set.ingredient.name === requiredSet.ingredient.name);
        if (!availableSet || availableSet.amount < requiredSet.amount) {
          canCook = false;
          break;
        }
      }
      if (canCook) {
        this.removeIngredientsFromInventory(currentIngredients, recipe.ingredients);
        return recipe;
      }
    }
  }
}
