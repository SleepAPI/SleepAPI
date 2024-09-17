import {
  CookedRecipeResult,
  CookingResult,
  IngredientSet,
  MAX_POT_SIZE,
  MathUtils,
  Recipe,
  curry,
  dessert,
  salad,
} from 'sleepapi-common';

interface CookedRecipe extends Recipe {
  name: string;
  extraTasty: boolean;
  sunday: boolean;
  nrOfFiller: number;
  strength: number;
}
interface SkippedRecipe extends Recipe {
  reason: 'pot' | 'ingredients';
  totalCount: number;
  potMissing: { count: number; totalAmountMissing: number };
  ingredientMissing: Map<string, { count: number; totalAmountMissing: number }>;
}

const allCurries: Recipe[] = curry.CURRIES.sort((a, b) => b.valueMax - a.valueMax);
const allSalads: Recipe[] = salad.SALADS.sort((a, b) => b.valueMax - a.valueMax);
const allDesserts: Recipe[] = dessert.DESSERTS.sort((a, b) => b.valueMax - a.valueMax);
export class CookingState {
  private camp;
  private bonusPotSize = 0;
  private bonusCritChance = 0;

  private cookedCurries: CookedRecipe[] = [];
  private cookedSalads: CookedRecipe[] = [];
  private cookedDesserts: CookedRecipe[] = [];

  private skippedCurries: Map<string, SkippedRecipe> = new Map();
  private skippedSalads: Map<string, SkippedRecipe> = new Map();
  private skippedDesserts: Map<string, SkippedRecipe> = new Map();

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
    const currentPotSize = this.currentPotSize(sunday);
    const currentCritChance = this.currentCritChance(sunday);

    const potLimitedCurries = this.findRecipesWithinPotLimit(allCurries, currentPotSize, this.skippedCurries);
    const cookedCurry =
      this.cookRecipeType({
        availableRecipes: potLimitedCurries,
        currentIngredients: this.currentCurryInventory,
        skippedRecipesGrouped: this.skippedCurries,
      }) ?? curry.MIXED_CURRY;

    const potLimitedSalads = this.findRecipesWithinPotLimit(allSalads, currentPotSize, this.skippedSalads);
    const cookedSalad =
      this.cookRecipeType({
        availableRecipes: potLimitedSalads,
        currentIngredients: this.currentSaladInventory,
        skippedRecipesGrouped: this.skippedSalads,
      }) ?? salad.MIXED_SALAD;

    const potLimitedDesserts = this.findRecipesWithinPotLimit(allDesserts, currentPotSize, this.skippedDesserts);
    const cookedDessert =
      this.cookRecipeType({
        availableRecipes: potLimitedDesserts,
        currentIngredients: this.currentDessertInventory,
        skippedRecipesGrouped: this.skippedDesserts,
      }) ?? dessert.MIXED_JUICE;

    const extraTasty = MathUtils.rollRandomChance(currentCritChance);
    const extraTastyFactor = extraTasty ? (sunday ? 3 : 2) : 1;

    if (extraTasty) {
      this.bonusCritChance = 0;
    }

    this.cookedCurries.push({
      ...cookedCurry,
      sunday,
      strength: cookedCurry.valueMax * extraTastyFactor,
      extraTasty,
      nrOfFiller: currentPotSize - cookedCurry.nrOfIngredients,
    });

    this.cookedSalads.push({
      ...cookedSalad,
      sunday,
      strength: cookedSalad.valueMax * extraTastyFactor,
      extraTasty,
      nrOfFiller: currentPotSize - cookedSalad.nrOfIngredients,
    });

    this.cookedDesserts.push({
      ...cookedDessert,
      sunday,
      strength: cookedDessert.valueMax * extraTastyFactor,
      extraTasty,
      nrOfFiller: currentPotSize - cookedDessert.nrOfIngredients,
    });

    this.bonusPotSize = 0;
  }

  public addCritBonus(amount: number) {
    this.bonusCritChance = Math.min(0.7, this.bonusCritChance + amount);
  }

  public addPotSize(amount: number) {
    this.bonusPotSize = Math.min(200, this.bonusPotSize + amount);
  }

  private findRecipesWithinPotLimit(
    recipes: Recipe[],
    potSize: number,
    skippedRecipesGrouped: Map<string, SkippedRecipe>
  ): Recipe[] {
    const potLimitedRecipes: Recipe[] = [];

    for (const recipe of recipes) {
      const missingPotSize = recipe.nrOfIngredients - potSize;

      if (missingPotSize < 0) {
        potLimitedRecipes.push(recipe);
      } else {
        let existingSkippedRecipe = skippedRecipesGrouped.get(recipe.name);

        if (!existingSkippedRecipe) {
          existingSkippedRecipe = {
            ...recipe,
            reason: 'pot',
            totalCount: 0,
            potMissing: { count: 0, totalAmountMissing: 0 },
            ingredientMissing: new Map(),
          };
          skippedRecipesGrouped.set(recipe.name, existingSkippedRecipe);
        }

        if (existingSkippedRecipe.potMissing) {
          existingSkippedRecipe.totalCount += 1;
          existingSkippedRecipe.potMissing.count += 1;
          existingSkippedRecipe.potMissing.totalAmountMissing += missingPotSize;
        }
      }
    }

    return potLimitedRecipes;
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
        cookedRecipes: this.groupAndCountCookedRecipes(this.cookedCurries, this.skippedCurries),
      },
      salad: {
        weeklyStrength: this.cookedSalads.reduce((sum, cur) => sum + cur.strength, 0) / nrOfWeeks,
        sundayStrength: this.cookedSalads.reduce((sum, cur) => sum + (cur.sunday ? cur.strength : 0), 0) / nrOfWeeks,
        cookedRecipes: this.groupAndCountCookedRecipes(this.cookedSalads, this.skippedSalads),
      },
      dessert: {
        weeklyStrength: this.cookedDesserts.reduce((sum, cur) => sum + cur.strength, 0) / nrOfWeeks,
        sundayStrength: this.cookedDesserts.reduce((sum, cur) => sum + (cur.sunday ? cur.strength : 0), 0) / nrOfWeeks,
        cookedRecipes: this.groupAndCountCookedRecipes(this.cookedDesserts, this.skippedDesserts),
      },
    };
  }

  private groupAndCountCookedRecipes(
    cookedRecipes: CookedRecipe[],
    skippedRecipesGrouped: Map<string, SkippedRecipe>
  ): CookedRecipeResult[] {
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

    const cookedRecipeResults: CookedRecipeResult[] = [];
    for (const [, cookedRecipe] of recipeCounts) {
      const skippedRecipe = skippedRecipesGrouped.get(cookedRecipe.recipe.name);

      const ingredientLimited = [];
      if (skippedRecipe) {
        for (const [ingredientName, { count, totalAmountMissing }] of skippedRecipe.ingredientMissing) {
          ingredientLimited.push({
            count,
            averageMissing: totalAmountMissing / count,
            ingredientName,
          });
        }
      }

      cookedRecipeResults.push({
        recipe: cookedRecipe.recipe,
        count: cookedRecipe.count,
        sunday: cookedRecipe.sunday,
        totalSkipped: skippedRecipe?.totalCount ?? 0,
        potLimited: {
          count: skippedRecipe?.potMissing.count ?? 0,
          averageMissing: skippedRecipe?.potMissing.count
            ? skippedRecipe.potMissing.totalAmountMissing / skippedRecipe.potMissing.count
            : 0,
        },
        ingredientLimited,
      });
    }

    return cookedRecipeResults;
  }

  private addIngredientsToInventory(inventory: IngredientSet[], ingredientSets: IngredientSet[]) {
    for (const { ingredient, amount } of ingredientSets) {
      const existingIngredientSet = inventory.find((set) => set.ingredient.name === ingredient.name);
      if (existingIngredientSet) {
        existingIngredientSet.amount += amount;
      } else {
        inventory.push({ ingredient, amount });
      }
    }
  }

  private removeIngredientsFromInventory(inventory: IngredientSet[], ingredientSets: IngredientSet[]) {
    for (const { ingredient, amount } of ingredientSets) {
      const existingIngredientSet = inventory.find((set) => set.ingredient.name === ingredient.name);
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
    skippedRecipesGrouped: Map<string, SkippedRecipe>;
  }): Recipe | undefined {
    const { availableRecipes, currentIngredients, skippedRecipesGrouped } = params;

    for (const recipe of availableRecipes) {
      let canCook = true;

      let existingEntry = skippedRecipesGrouped.get(recipe.name);
      if (!existingEntry) {
        existingEntry = {
          ...recipe,
          reason: 'ingredients',
          totalCount: 0,
          potMissing: { count: 0, totalAmountMissing: 0 },
          ingredientMissing: new Map(),
        };
        skippedRecipesGrouped.set(recipe.name, existingEntry);
      }

      for (const requiredSet of recipe.ingredients) {
        const availableSet = currentIngredients.find((set) => set.ingredient.name === requiredSet.ingredient.name);
        const missingAmount = requiredSet.amount - (availableSet?.amount ?? 0);

        if (missingAmount > 0) {
          canCook = false;

          const ingredientEntry = existingEntry.ingredientMissing.get(requiredSet.ingredient.name);
          if (ingredientEntry) {
            ingredientEntry.count += 1;
            ingredientEntry.totalAmountMissing += missingAmount;
          } else {
            existingEntry.ingredientMissing.set(requiredSet.ingredient.name, {
              count: 1,
              totalAmountMissing: missingAmount,
            });
          }
        }
      }

      if (canCook) {
        this.removeIngredientsFromInventory(currentIngredients, recipe.ingredients);
        return recipe;
      } else {
        existingEntry.totalCount += 1;
      }
    }
  }
}
