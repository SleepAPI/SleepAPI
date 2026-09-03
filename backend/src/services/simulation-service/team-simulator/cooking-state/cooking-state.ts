import type {
  UserRecipeFlat,
  UserRecipes
} from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import type {
  CookedRecipeResult,
  CookingResult,
  IngredientIndexToFloatAmount,
  MealPlan,
  DailyMealPlan,
  MealSlot,
  MealTimes,
  RecipeType,
  TeamSettingsExt
} from 'sleepapi-common';
import {
  curry,
  defaultMealPlan,
  defaultDailyMealPlan,
  dessert,
  emptyIngredientInventoryFloat,
  flatToIngredientSet,
  ingredient,
  recipeLevelBonus,
  salad
} from 'sleepapi-common';

interface CookedRecipe extends UserRecipeFlat {
  name: string;
  extraTasty: boolean;
  sunday: boolean;
  nrOfFiller: number;
  fillerValue: number;
  isPlannedRecipe: boolean;
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
  private wakeupMinutes: number;
  private mealCookTimeTotals: Record<MealSlot, number> = { breakfast: 0, lunch: 0, dinner: 0 };
  private mealCookCounts: Record<MealSlot, number> = { breakfast: 0, lunch: 0, dinner: 0 };
  private recipeType: RecipeType;
  private mealPlan: MealPlan;
  private weekdayReservedIngredientIndexes = new Set<number>();
  private sundayReservedIngredients: IngredientIndexToFloatAmount = emptyIngredientInventoryFloat();
  private completedMeals = new Set<MealSlot>();

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

  constructor(settings: TeamSettingsExt, userRecipes: UserRecipes, rng: PreGeneratedRandom) {
    const { curries, salads, desserts } = userRecipes;
    this.userCurries = curries;
    this.userSalads = salads;
    this.userDesserts = desserts;
    this.rng = rng;

    this.camp = settings.camp;
    this.userPotSize = settings.potSize;
    this.wakeupMinutes = settings.wakeup.hour * 60 + settings.wakeup.minute;
    this.recipeType = settings.recipeType ?? 'curry';
    this.mealPlan = settings.mealPlan ?? defaultMealPlan();
    this.startingStockpiledIngredients = settings.stockpiledIngredients;
    this.currentCurryStockpile = settings.stockpiledIngredients.slice();
    this.currentSaladStockpile = settings.stockpiledIngredients.slice();
    this.currentDessertStockpile = settings.stockpiledIngredients.slice();

    for (const choice of Object.values(this.mealPlanForDay(false))) {
      if (choice.kind === 'recipe') {
        const recipe = this.recipesForType(this.recipeType).find((candidate) => candidate.name === choice.recipe);
        recipe?.ingredients.forEach((amount, index) => amount > 0 && this.weekdayReservedIngredientIndexes.add(index));
      }
    }
    for (const choice of Object.values(this.mealPlanForDay(true))) {
      if (choice.kind === 'recipe') {
        const recipe = this.recipesForType(this.recipeType).find((candidate) => candidate.name === choice.recipe);
        recipe?.ingredients.forEach((amount, index) => (this.sundayReservedIngredients[index] += amount));
      }
    }
  }

  public startNewWeek() {
    this.currentCurryStockpile = this.startingStockpiledIngredients.slice();
    this.currentSaladStockpile = this.startingStockpiledIngredients.slice();
    this.currentDessertStockpile = this.startingStockpiledIngredients.slice();
  }

  public startNewDay() {
    this.completedMeals.clear();
  }

  public hasMealPlan(sunday: boolean) {
    return Object.values(this.mealPlanForDay(sunday)).some((choice) => choice.kind !== 'best');
  }

  public isMealCompleted(meal: MealSlot) {
    return this.completedMeals.has(meal);
  }

  public cookPlannedMeal(params: { meal: MealSlot; finalAttempt: boolean; sunday: boolean }): boolean {
    const { meal, finalAttempt, sunday } = params;
    if (this.completedMeals.has(meal)) return false;

    const choice = this.mealPlanForDay(sunday)[meal];
    if (choice.kind === 'none') {
      if (finalAttempt) this.completedMeals.add(meal);
      return false;
    }

    if (choice.kind === 'recipe' && !finalAttempt) {
      const recipe = this.recipesForType(this.recipeType).find((candidate) => candidate.name === choice.recipe);
      if (recipe && this.cookExactRecipe(recipe, sunday, true, true)) {
        if (sunday) this.releaseSundayReservation(recipe);
        this.completedMeals.add(meal);
        return true;
      }
      return false;
    }

    if (!finalAttempt) return false;

    this.completedMeals.add(meal);
    if (choice.kind === 'recipe') {
      const selectedRecipe = this.recipesForType(this.recipeType).find((candidate) => candidate.name === choice.recipe);
      if (selectedRecipe && this.cookExactRecipe(selectedRecipe, sunday, true, true)) {
        if (sunday) this.releaseSundayReservation(selectedRecipe);
        return true;
      }
      if (selectedRecipe && sunday) this.releaseSundayReservation(selectedRecipe);
    }

    return this.cookBestUnreservedRecipe(sunday);
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

  public recordMealCookTime(meal: MealSlot, minutesSinceWakeup: number) {
    this.mealCookTimeTotals[meal] += minutesSinceWakeup;
    this.mealCookCounts[meal] += 1;
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
      nrOfFiller: currentPotSize - cookedCurry.nrOfIngredients,
      fillerValue: 0,
      isPlannedRecipe: false
    });

    this.cookedSalads.push({
      ...cookedSalad,
      sunday,
      strength: cookedSalad.valueMax * extraTastyFactor,
      extraTasty,
      nrOfFiller: currentPotSize - cookedSalad.nrOfIngredients,
      fillerValue: 0,
      isPlannedRecipe: false
    });

    this.cookedDesserts.push({
      ...cookedDessert,
      sunday,
      strength: cookedDessert.valueMax * extraTastyFactor,
      extraTasty,
      nrOfFiller: currentPotSize - cookedDessert.nrOfIngredients,
      fillerValue: 0,
      isPlannedRecipe: false
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

  private recipesForType(type: RecipeType): UserRecipeFlat[] {
    if (type === 'curry') return this.userCurries;
    if (type === 'salad') return this.userSalads;
    return this.userDesserts;
  }

  private mealPlanForDay(sunday: boolean): DailyMealPlan {
    const plan = sunday ? (this.mealPlan.sunday ?? defaultDailyMealPlan()) : this.mealPlan;
    return {
      breakfast: plan.breakfast,
      lunch: plan.lunch,
      dinner: plan.dinner
    };
  }

  private cookingDataForType(type: RecipeType) {
    if (type === 'curry') {
      return {
        inventory: this.currentCurryInventory,
        stockpile: this.currentCurryStockpile,
        cooked: this.cookedCurries
      };
    }
    if (type === 'salad') {
      return {
        inventory: this.currentSaladInventory,
        stockpile: this.currentSaladStockpile,
        cooked: this.cookedSalads
      };
    }
    return {
      inventory: this.currentDessertInventory,
      stockpile: this.currentDessertStockpile,
      cooked: this.cookedDesserts
    };
  }

  private cookExactRecipe(
    recipe: UserRecipeFlat,
    sunday: boolean,
    includeFillers: boolean = false,
    isPlannedRecipe: boolean = false
  ): boolean {
    const currentPotSize = this.currentPotSize(sunday);
    if (recipe.nrOfIngredients > currentPotSize) return false;

    const { inventory, stockpile, cooked } = this.cookingDataForType(this.recipeType);
    for (let index = 0; index < recipe.ingredients.length; index++) {
      if (recipe.ingredients[index] > inventory[index] + stockpile[index]) return false;
    }

    this.consumeIngredients(recipe.ingredients, inventory, stockpile);
    const fillerTotal = includeFillers ? this.fillPot({ currentPotSize, inventory, stockpile, recipe }) : 0;
    this.recordPlannedCook({ recipe, sunday, currentPotSize, fillerTotal, isPlannedRecipe, cooked });
    return true;
  }

  private cookBestUnreservedRecipe(sunday: boolean): boolean {
    const { inventory, stockpile } = this.cookingDataForType(this.recipeType);
    const recipes = this.recipesForType(this.recipeType).filter((recipe) =>
      this.canUseRecipeForFallback(recipe, inventory, stockpile)
    );
    for (const recipe of recipes) {
      if (this.cookExactRecipe(recipe, sunday)) return true;
    }

    const mixedRecipe =
      this.recipeType === 'curry'
        ? { ...curry.MIXED_CURRY_FLAT, level: 1 }
        : this.recipeType === 'salad'
          ? { ...salad.MIXED_SALAD_FLAT, level: 1 }
          : { ...dessert.MIXED_JUICE_FLAT, level: 1 };
    return this.cookExactRecipe(mixedRecipe, sunday);
  }

  private canUseRecipeForFallback(
    recipe: UserRecipeFlat,
    inventory: IngredientIndexToFloatAmount,
    stockpile: IngredientIndexToFloatAmount
  ) {
    return recipe.ingredients.every((amount, index) => {
      if (amount === 0) return true;
      if (this.weekdayReservedIngredientIndexes.has(index)) return false;
      return inventory[index] + stockpile[index] - amount >= this.sundayReservedIngredients[index];
    });
  }

  private releaseSundayReservation(recipe: UserRecipeFlat) {
    recipe.ingredients.forEach((amount, index) => {
      this.sundayReservedIngredients[index] -= amount;
    });
  }

  private consumeIngredients(
    requiredIngredients: Float32Array,
    inventory: IngredientIndexToFloatAmount,
    stockpile: IngredientIndexToFloatAmount
  ) {
    for (let index = 0; index < requiredIngredients.length; index++) {
      const requiredAmount = requiredIngredients[index];
      const fromInventory = Math.min(requiredAmount, inventory[index]);
      inventory[index] -= fromInventory;
      stockpile[index] -= requiredAmount - fromInventory;
    }
  }

  private fillPot(params: {
    currentPotSize: number;
    inventory: IngredientIndexToFloatAmount;
    stockpile: IngredientIndexToFloatAmount;
    recipe: UserRecipeFlat;
  }): number {
    const { currentPotSize, inventory, stockpile, recipe } = params;
    let remainingSlots = currentPotSize - recipe.nrOfIngredients;
    let fillerTotal = 0;

    const ingredientIndexes = ingredient.INGREDIENTS.map((_, index) => index)
      .filter((index) => !this.weekdayReservedIngredientIndexes.has(index))
      .sort((a, b) => ingredient.INGREDIENTS[b].value - ingredient.INGREDIENTS[a].value);

    for (const index of ingredientIndexes) {
      if (remainingSlots <= 0) break;
      const availableFiller = Math.max(inventory[index] + stockpile[index] - this.sundayReservedIngredients[index], 0);
      const amount = Math.min(remainingSlots, availableFiller);
      const fromInventory = Math.min(amount, inventory[index]);
      inventory[index] -= fromInventory;
      stockpile[index] -= amount - fromInventory;
      fillerTotal += amount * ingredient.INGREDIENTS[index].value;
      remainingSlots -= amount;
    }
    return fillerTotal;
  }

  private recordPlannedCook(params: {
    recipe: UserRecipeFlat;
    sunday: boolean;
    currentPotSize: number;
    fillerTotal: number;
    isPlannedRecipe: boolean;
    cooked: CookedRecipe[];
  }) {
    const { recipe, sunday, currentPotSize, fillerTotal, isPlannedRecipe, cooked } = params;
    const currentCritChance = this.currentCritChance(sunday);
    this.totalCritChance += currentCritChance;
    if (!sunday) this.totalWeekdayPotSize += currentPotSize;

    const extraTasty = this.rng() < currentCritChance;
    const extraTastyFactor = extraTasty ? (sunday ? 3 : 2) : 1;
    if (extraTasty) this.bonusCritChance = 0;

    cooked.push({
      ...recipe,
      sunday,
      strength: (recipe.value * recipeLevelBonus[recipe.level] + fillerTotal) * extraTastyFactor,
      extraTasty,
      nrOfFiller: currentPotSize - recipe.nrOfIngredients,
      fillerValue: fillerTotal,
      isPlannedRecipe
    });
    this.bonusPotSize = 0;
  }

  public results(days: number): CookingResult {
    // TODO: calc fillers, iterate recipes and don't forget about checking if crit and if sunday (2x or 3x, or 1x base)

    const nrOfWeeks = Math.max(days / 7, 1);
    // TODO: we can solve this in fewer iterations.
    // TODO: CookedCurries/salads etc are all same length always, we can do the entire thing in a single loop
    const plannedCookedRecipes = this.cookingDataForType(this.recipeType).cooked;
    const critCookedRecipes =
      this.hasMealPlan(false) || this.hasMealPlan(true) ? plannedCookedRecipes : this.cookedCurries;
    const critCookCount = Math.max(critCookedRecipes.length, 1);

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
          critCookedRecipes.reduce((sum, cur) => sum + (cur.extraTasty ? (cur.sunday ? 3 : 2) : 1), 0) / critCookCount,
        averageCritChancePerCook: this.totalCritChance / critCookCount,
        averageWeekdayPotSize: this.totalWeekdayPotSize / (critCookCount * (6 / 7)) // only weekdays
      },
      mealTimes: this.averageMealTimes()
    };
  }

  private averageMealTimes(): MealTimes {
    const result: MealTimes = {};
    for (const meal of ['breakfast', 'lunch', 'dinner'] as MealSlot[]) {
      const count = this.mealCookCounts[meal];
      if (count === 0) continue;

      const averageMinutesSinceWakeup = Math.round(this.mealCookTimeTotals[meal] / count / 5) * 5;
      const minutesSinceMidnight = (this.wakeupMinutes + averageMinutesSinceWakeup) % (24 * 60);
      result[meal] = {
        hour: Math.floor(minutesSinceMidnight / 60),
        minute: minutesSinceMidnight % 60,
        second: 0
      };
    }
    return result;
  }

  private groupAndCountCookedRecipes(
    cookedRecipes: CookedRecipe[],
    skippedRecipesGrouped: Map<string, SkippedRecipe>
  ): CookedRecipeResult[] {
    const recipeCounts = new Map<
      string,
      { recipe: UserRecipeFlat; count: number; sunday: number; fillerValue: number; plannedCount: number }
    >();

    for (const recipe of cookedRecipes) {
      const recipeName = recipe.name;
      const currentEntry = recipeCounts.get(recipeName);
      const sunday = recipe.sunday ? 1 : 0;

      if (currentEntry) {
        currentEntry.count += 1;
        currentEntry.sunday += sunday;
        currentEntry.fillerValue += recipe.fillerValue;
        currentEntry.plannedCount += recipe.isPlannedRecipe ? 1 : 0;
      } else {
        recipeCounts.set(recipeName, {
          recipe,
          count: 1,
          sunday,
          fillerValue: recipe.fillerValue,
          plannedCount: recipe.isPlannedRecipe ? 1 : 0
        });
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
        ingredientLimited,
        averageFillerValue: cookedRecipe.fillerValue / cookedRecipe.count,
        isPlannedRecipe: cookedRecipe.plannedCount > 0
      });
    }

    return cookedRecipeResults;
  }
}
