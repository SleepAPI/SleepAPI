import type {
  UserRecipeFlat,
  UserRecipes
} from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import type {
  CookedRecipeResult,
  CookingResult,
  IngredientIndexToFloatAmount,
  MealTimes,
  TeamSettings
} from 'sleepapi-common';
import { curry, dessert, emptyIngredientInventoryFloat, flatToIngredientSet, ingredient, salad } from 'sleepapi-common';

interface CookedRecipe extends UserRecipeFlat {
  name: string;
  extraTasty: boolean;
  sunday: boolean;
  nrOfFiller: number;
  strength: number;
}
type IngredientsMissing = Record<number, { count: number; totalAmountMissing: number }>;
interface SkippedRecipe extends UserRecipeFlat {
  totalCount: number;
  potMissing: { count: number; totalAmountMissing: number };
  ingredientMissing: IngredientsMissing;
}

export class CookingState {
  private camp;
  private bonusPotSize = 0;
  private bonusCritChance = 0;
  private totalCritChance = 0;
  private totalWeekdayPotSize = 0;
  private rng: PreGeneratedRandom;
  private userPotSize: number;
  private mealTimes: MealTimes = {};

  private userCurries: UserRecipeFlat[];
  private userSalads: UserRecipeFlat[];
  private userDesserts: UserRecipeFlat[];

  private cookedCurries: CookedRecipe[] = [];
  private cookedSalads: CookedRecipe[] = [];
  private cookedDesserts: CookedRecipe[] = [];

  private skippedCurries: Map<string, SkippedRecipe> = new Map();
  private skippedSalads: Map<string, SkippedRecipe> = new Map();
  private skippedDesserts: Map<string, SkippedRecipe> = new Map();

  private currentCurryInventory: IngredientIndexToFloatAmount = emptyIngredientInventoryFloat();
  private currentSaladInventory: IngredientIndexToFloatAmount = emptyIngredientInventoryFloat();
  private currentDessertInventory: IngredientIndexToFloatAmount = emptyIngredientInventoryFloat();

  private startingStockpiledIngredients: IngredientIndexToFloatAmount;
  private currentCurryStockpile: IngredientIndexToFloatAmount;
  private currentSaladStockpile: IngredientIndexToFloatAmount;
  private currentDessertStockpile: IngredientIndexToFloatAmount;

  constructor(settings: TeamSettings, userRecipes: UserRecipes, rng: PreGeneratedRandom) {
    const { curries, salads, desserts } = userRecipes;
    this.userCurries = curries;
    this.userSalads = salads;
    this.userDesserts = desserts;
    this.rng = rng;

    this.camp = settings.camp;
    this.userPotSize = settings.potSize;
    this.startingStockpiledIngredients = settings.stockpiledIngredients;
    this.currentCurryStockpile = settings.stockpiledIngredients.slice();
    this.currentSaladStockpile = settings.stockpiledIngredients.slice();
    this.currentDessertStockpile = settings.stockpiledIngredients.slice();
  }

  public startNewWeek() {
    this.currentCurryStockpile = this.startingStockpiledIngredients.slice();
    this.currentSaladStockpile = this.startingStockpiledIngredients.slice();
    this.currentDessertStockpile = this.startingStockpiledIngredients.slice();
  }

  public addIngredients(ingredients: IngredientIndexToFloatAmount) {
    for (let i = 0; i < ingredient.TOTAL_NUMBER_OF_INGREDIENTS; i++) {
      this.currentCurryInventory[i] += ingredients[i];
      this.currentSaladInventory[i] += ingredients[i];
      this.currentDessertInventory[i] += ingredients[i];
    }
  }

  public setMealTimes(mealTimes: MealTimes) {
    this.mealTimes = mealTimes;
  }

  public cook(sunday: boolean) {
    const currentPotSize = this.currentPotSize(sunday);
    const currentCritChance = this.currentCritChance(sunday);
    this.totalCritChance += currentCritChance;
    if (!sunday) {
      this.totalWeekdayPotSize += currentPotSize;
    }

    const potLimitedCurries = this.findRecipesWithinPotLimit(this.userCurries, currentPotSize, this.skippedCurries);
    const cookedCurry = this.cookRecipeType({
      availableRecipes: potLimitedCurries,
      currentIngredients: this.currentCurryInventory,
      skippedRecipesGrouped: this.skippedCurries,
      currentStockpile: this.currentCurryStockpile
    }) ?? { ...curry.MIXED_CURRY_FLAT, level: 1 };

    const potLimitedSalads = this.findRecipesWithinPotLimit(this.userSalads, currentPotSize, this.skippedSalads);
    const cookedSalad = this.cookRecipeType({
      availableRecipes: potLimitedSalads,
      currentIngredients: this.currentSaladInventory,
      skippedRecipesGrouped: this.skippedSalads,
      currentStockpile: this.currentSaladStockpile
    }) ?? { ...salad.MIXED_SALAD_FLAT, level: 1 };

    const potLimitedDesserts = this.findRecipesWithinPotLimit(this.userDesserts, currentPotSize, this.skippedDesserts);
    const cookedDessert = this.cookRecipeType({
      availableRecipes: potLimitedDesserts,
      currentIngredients: this.currentDessertInventory,
      skippedRecipesGrouped: this.skippedDesserts,
      currentStockpile: this.currentDessertStockpile
    }) ?? { ...dessert.MIXED_JUICE_FLAT, level: 1 };

    const extraTasty = this.rng() < currentCritChance;
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
    // TODO: instead of voiding the proc, we should postpone
    this.bonusCritChance = Math.min(0.7, this.bonusCritChance + amount);
  }

  public addPotSize(amount: number) {
    this.bonusPotSize = Math.min(200, this.bonusPotSize + amount);
  }

  private cookRecipeType(params: {
    availableRecipes: UserRecipeFlat[];
    currentIngredients: IngredientIndexToFloatAmount;
    skippedRecipesGrouped: Map<string, SkippedRecipe>;
    currentStockpile: IngredientIndexToFloatAmount;
  }): UserRecipeFlat | undefined {
    const { availableRecipes, currentIngredients, skippedRecipesGrouped, currentStockpile } = params;

    for (let recipeIndex = 0; recipeIndex < availableRecipes.length; ++recipeIndex) {
      const recipe = availableRecipes[recipeIndex];
      const existingEntry = this.getOrInitSkippedRecipe(recipe, skippedRecipesGrouped);

      let canCook = true;
      const ingredientMissing = existingEntry.ingredientMissing;

      // First pass: validate that we can cook the recipe and compute what's missing
      for (let i = 0; i < recipe.ingredients.length; i++) {
        const requiredAmount = recipe.ingredients[i];
        const availableInventory = currentIngredients[i];
        const availableStockpile = currentStockpile[i];

        const totalAvailable = availableInventory + availableStockpile;

        if (requiredAmount > totalAvailable) {
          // Can't cook this recipe, track the missing amount and fail early
          canCook = false;
          ingredientMissing[i].count += 1;
          ingredientMissing[i].totalAmountMissing += requiredAmount - totalAvailable;
          break;
        }
      }

      if (canCook) {
        // Second pass: perform the actual subtraction from inventory and stockpile
        for (let i = 0; i < recipe.ingredients.length; i++) {
          const requiredAmount = recipe.ingredients[i];
          const availableInventory = currentIngredients[i];

          if (availableInventory >= requiredAmount) {
            // Fully covered by inventory
            currentIngredients[i] -= requiredAmount;
          } else {
            // Partially covered by inventory, fallback to stockpile
            const remainingNeeded = requiredAmount - availableInventory;
            currentIngredients[i] = 0; // All inventory used up
            currentStockpile[i] -= remainingNeeded;
          }
        }
        return recipe; // Success, return the cooked recipe
      } else {
        existingEntry.totalCount += 1;
      }
    }

    return undefined; // No recipe could be cooked
  }

  private findRecipesWithinPotLimit(
    recipes: UserRecipeFlat[],
    potSize: number,
    skippedRecipesGrouped: Map<string, SkippedRecipe>
  ): UserRecipeFlat[] {
    const allowedRecipes: UserRecipeFlat[] = [];

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

  private getOrInitSkippedRecipe(
    recipe: UserRecipeFlat,
    skippedRecipesGrouped: Map<string, SkippedRecipe>
  ): SkippedRecipe {
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
    const basePotSize = this.userPotSize * (sunday ? 2 : 1);
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
      },
      mealTimes: this.mealTimes
    };
  }

  private groupAndCountCookedRecipes(
    cookedRecipes: CookedRecipe[],
    skippedRecipesGrouped: Map<string, SkippedRecipe>
  ): CookedRecipeResult[] {
    const recipeCounts = new Map<string, { recipe: UserRecipeFlat; count: number; sunday: number }>();

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
        level: cookedRecipe.recipe.level,
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
