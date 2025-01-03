import type { CookedRecipeResult, CookingResult, IngredientIndexToFloatAmount, RecipeFlat } from 'sleepapi-common';
import {
  MAX_POT_SIZE,
  RandomUtils,
  curry,
  dessert,
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ingredient,
  salad
} from 'sleepapi-common';

interface CookedRecipe extends RecipeFlat {
  name: string;
  extraTasty: boolean;
  sunday: boolean;
  nrOfFiller: number;
  strength: number;
}
type IngredientsMissing = Record<number, { count: number; totalAmountMissing: number }>;
interface SkippedRecipe extends RecipeFlat {
  totalCount: number;
  potMissing: { count: number; totalAmountMissing: number };
  ingredientMissing: IngredientsMissing;
}

const allCurries: RecipeFlat[] = curry.CURRIES_FLAT.sort((a, b) => b.valueMax - a.valueMax);
const allSalads: RecipeFlat[] = salad.SALADS_FLAT.sort((a, b) => b.valueMax - a.valueMax);
const allDesserts: RecipeFlat[] = dessert.DESSERTS_FLAT.sort((a, b) => b.valueMax - a.valueMax);
export class CookingState {
  private camp;
  private bonusPotSize = 0;
  private bonusCritChance = 0;
  private totalCritChance = 0;
  private totalWeekdayPotSize = 0;

  private cookedCurries: CookedRecipe[] = [];
  private cookedSalads: CookedRecipe[] = [];
  private cookedDesserts: CookedRecipe[] = [];

  private skippedCurries: Map<string, SkippedRecipe> = new Map();
  private skippedSalads: Map<string, SkippedRecipe> = new Map();
  private skippedDesserts: Map<string, SkippedRecipe> = new Map();

  private currentCurryInventory: IngredientIndexToFloatAmount = emptyIngredientInventoryFloat();
  private currentSaladInventory: IngredientIndexToFloatAmount = emptyIngredientInventoryFloat();
  private currentDessertInventory: IngredientIndexToFloatAmount = emptyIngredientInventoryFloat();

  constructor(camp: boolean) {
    this.camp = camp;
  }

  public addIngredients(ingredients: IngredientIndexToFloatAmount) {
    for (let i = 0; i < ingredients.length; i++) {
      this.currentCurryInventory[i] += ingredients[i];
      this.currentSaladInventory[i] += ingredients[i];
      this.currentDessertInventory[i] += ingredients[i];
    }
  }

  public cook(sunday: boolean) {
    const currentPotSize = this.currentPotSize(sunday);
    const currentCritChance = this.currentCritChance(sunday);
    this.totalCritChance += currentCritChance;
    if (!sunday) {
      this.totalWeekdayPotSize += currentPotSize;
    }

    const potLimitedCurries = this.findRecipesWithinPotLimit(allCurries, currentPotSize, this.skippedCurries);
    const cookedCurry =
      this.cookRecipeType({
        availableRecipes: potLimitedCurries,
        currentIngredients: this.currentCurryInventory,
        skippedRecipesGrouped: this.skippedCurries
      }) ?? curry.MIXED_CURRY_FLAT;

    const potLimitedSalads = this.findRecipesWithinPotLimit(allSalads, currentPotSize, this.skippedSalads);
    const cookedSalad =
      this.cookRecipeType({
        availableRecipes: potLimitedSalads,
        currentIngredients: this.currentSaladInventory,
        skippedRecipesGrouped: this.skippedSalads
      }) ?? salad.MIXED_SALAD_FLAT;

    const potLimitedDesserts = this.findRecipesWithinPotLimit(allDesserts, currentPotSize, this.skippedDesserts);
    const cookedDessert =
      this.cookRecipeType({
        availableRecipes: potLimitedDesserts,
        currentIngredients: this.currentDessertInventory,
        skippedRecipesGrouped: this.skippedDesserts
      }) ?? dessert.MIXED_JUICE_FLAT;

    const extraTasty = RandomUtils.roll(currentCritChance);
    const extraTastyFactor = extraTasty ? (sunday ? 3 : 2) : 1;

    if (extraTasty) {
      this.bonusCritChance = 0;
    }

    this.cookedCurries.push({
      ...cookedCurry,
      sunday,
      strength: cookedCurry.valueMax * extraTastyFactor,
      extraTasty,
      nrOfFiller: currentPotSize - cookedCurry.nrOfIngredients
    });

    this.cookedSalads.push({
      ...cookedSalad,
      sunday,
      strength: cookedSalad.valueMax * extraTastyFactor,
      extraTasty,
      nrOfFiller: currentPotSize - cookedSalad.nrOfIngredients
    });

    this.cookedDesserts.push({
      ...cookedDessert,
      sunday,
      strength: cookedDessert.valueMax * extraTastyFactor,
      extraTasty,
      nrOfFiller: currentPotSize - cookedDessert.nrOfIngredients
    });

    this.bonusPotSize = 0;
  }

  public addCritBonus(amount: number) {
    this.bonusCritChance = Math.min(0.7, this.bonusCritChance + amount);
  }

  public addPotSize(amount: number) {
    this.bonusPotSize = Math.min(200, this.bonusPotSize + amount);
  }

  private cookRecipeType(params: {
    availableRecipes: RecipeFlat[];
    currentIngredients: IngredientIndexToFloatAmount;
    skippedRecipesGrouped: Map<string, SkippedRecipe>;
  }): RecipeFlat | undefined {
    const { availableRecipes, currentIngredients, skippedRecipesGrouped } = params;

    for (let recipeIndex = 0; recipeIndex < availableRecipes.length; ++recipeIndex) {
      const recipe = availableRecipes[recipeIndex];

      // If this recipe has failed before, get it; otherwise, create a new entry with default values.
      const existingEntry: SkippedRecipe = this.getOrInitSkippedRecipe(recipe, skippedRecipesGrouped);

      let canCook = true;
      const ingredientMissing = existingEntry.ingredientMissing;
      for (let ingredientIndex = 0; ingredientIndex < recipe.ingredients.length; ingredientIndex++) {
        const missingAmount = recipe.ingredients[ingredientIndex] - currentIngredients[ingredientIndex];

        if (missingAmount > 0) {
          canCook = false;
          ingredientMissing[ingredientIndex].count += 1;
          ingredientMissing[ingredientIndex].totalAmountMissing += missingAmount;
        }
      }

      if (canCook) {
        currentIngredients._mapCombine(recipe.ingredients, (a, b) => a - b);
        return recipe;
      } else {
        existingEntry.totalCount += 1;
      }
    }

    return undefined;
  }

  private findRecipesWithinPotLimit(
    recipes: RecipeFlat[],
    potSize: number,
    skippedRecipesGrouped: Map<string, SkippedRecipe>
  ): RecipeFlat[] {
    const allowedRecipes: RecipeFlat[] = [];

    for (const recipe of recipes) {
      const missingPotSize = recipe.nrOfIngredients - potSize;
      if (missingPotSize <= 0) {
        allowedRecipes.push(recipe);
      } else {
        const existingSkippedRecipe = this.getOrInitSkippedRecipe(recipe, skippedRecipesGrouped);

        existingSkippedRecipe.totalCount += 1;
        existingSkippedRecipe.potMissing.count += 1;
        existingSkippedRecipe.potMissing.totalAmountMissing += missingPotSize;
      }
    }

    return allowedRecipes;
  }

  private getOrInitSkippedRecipe(recipe: RecipeFlat, skippedRecipesGrouped: Map<string, SkippedRecipe>): SkippedRecipe {
    return (
      skippedRecipesGrouped.get(recipe.name) ??
      (() => {
        const ingredientMissing: IngredientsMissing = {};
        for (let j = 0; j < ingredient.INGREDIENTS.length; j++) {
          ingredientMissing[j] = { count: 0, totalAmountMissing: 0 };
        }

        const newEntry: SkippedRecipe = {
          ...recipe,
          totalCount: 0,
          potMissing: { count: 0, totalAmountMissing: 0 },
          ingredientMissing
        };
        skippedRecipesGrouped.set(recipe.name, newEntry);
        return newEntry;
      })()
    );
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
    // TODO: we can solve this in fewer iterations.
    // TODO: CookedCurries/salads etc are all same length always, we can do the entire thing in a single loop
    return {
      curry: {
        weeklyStrength: this.cookedCurries.reduce((sum, cur) => sum + cur.strength, 0) / nrOfWeeks,
        sundayStrength: this.cookedCurries.reduce((sum, cur) => sum + (cur.sunday ? cur.strength : 0), 0) / nrOfWeeks,
        cookedRecipes: this.groupAndCountCookedRecipes(this.cookedCurries, this.skippedCurries)
      },
      salad: {
        weeklyStrength: this.cookedSalads.reduce((sum, cur) => sum + cur.strength, 0) / nrOfWeeks,
        sundayStrength: this.cookedSalads.reduce((sum, cur) => sum + (cur.sunday ? cur.strength : 0), 0) / nrOfWeeks,
        cookedRecipes: this.groupAndCountCookedRecipes(this.cookedSalads, this.skippedSalads)
      },
      dessert: {
        weeklyStrength: this.cookedDesserts.reduce((sum, cur) => sum + cur.strength, 0) / nrOfWeeks,
        sundayStrength: this.cookedDesserts.reduce((sum, cur) => sum + (cur.sunday ? cur.strength : 0), 0) / nrOfWeeks,
        cookedRecipes: this.groupAndCountCookedRecipes(this.cookedDesserts, this.skippedDesserts)
      },
      critInfo: {
        averageCritMultiplierPerCook:
          this.cookedCurries.reduce((sum, cur) => sum + (cur.extraTasty ? (cur.sunday ? 3 : 2) : 1), 0) /
          this.cookedCurries.length,
        averageCritChancePerCook: this.totalCritChance / this.cookedCurries.length,
        averageWeekdayPotSize: this.totalWeekdayPotSize / (this.cookedCurries.length * (6 / 7)) // only weekdays
      }
    };
  }

  private groupAndCountCookedRecipes(
    cookedRecipes: CookedRecipe[],
    skippedRecipesGrouped: Map<string, SkippedRecipe>
  ): CookedRecipeResult[] {
    const recipeCounts = new Map<string, { recipe: RecipeFlat; count: number; sunday: number }>();

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
        for (const [ingredientIndex, { count, totalAmountMissing }] of Object.entries(
          skippedRecipe.ingredientMissing
        )) {
          count > 0 &&
            ingredientLimited.push({
              count,
              averageMissing: totalAmountMissing / count,
              ingredientName: ingredient.INGREDIENTS[+ingredientIndex].name
            });
        }
      }

      cookedRecipeResults.push({
        recipe: { ...cookedRecipe.recipe, ingredients: flatToIngredientSet(cookedRecipe.recipe.ingredients) },
        count: cookedRecipe.count,
        sunday: cookedRecipe.sunday,
        totalSkipped: skippedRecipe?.totalCount ?? 0,
        potLimited: {
          count: skippedRecipe?.potMissing.count ?? 0,
          averageMissing: skippedRecipe?.potMissing.count
            ? skippedRecipe.potMissing.totalAmountMissing / skippedRecipe.potMissing.count
            : 0
        },
        ingredientLimited
      });
    }

    return cookedRecipeResults;
  }
}
