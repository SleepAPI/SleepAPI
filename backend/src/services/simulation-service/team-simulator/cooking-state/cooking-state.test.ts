import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { defaultUserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import type { PreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { mocks } from '@src/vitest/index.js';
import {
  defaultMealPlan,
  dessert,
  emptyIngredientInventoryFloat,
  ingredient,
  ingredientSetToFloatFlat,
  MAX_POT_SIZE,
  parseTime,
  recipeLevelBonus
} from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

function noCritRandom(): PreGeneratedRandom {
  const rng = (() => 0.99) as PreGeneratedRandom;
  rng.getUint8 = () => 255;
  rng.getIndex = () => 0;
  rng.randomElement = <T>(array: T[]) => array[0];
  return rng;
}

describe('CookingState', () => {
  it('shall include average cooked meal times in results', () => {
    const cookingState = new CookingState(
      mocks.teamSettingsExt({ camp: true }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    cookingState.recordMealCookTime('breakfast', 120);
    cookingState.recordMealCookTime('lunch', 480);
    cookingState.recordMealCookTime('dinner', 840);

    const result = cookingState.results(1);

    expect(result.mealTimes).toEqual({
      breakfast: parseTime('08:00'),
      lunch: parseTime('14:00'),
      dinner: parseTime('20:00')
    });
  });

  it('shall cook the best recipe for which it has ingredients', () => {
    const cookingState = new CookingState(
      mocks.teamSettingsExt({ camp: true, potSize: MAX_POT_SIZE }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    const ingsForMacaronsAndFlan = ingredientSetToFloatFlat([
      ...dessert.JIGGLYPUFFS_FRUITY_FLAN.ingredients,
      ...dessert.FLOWER_GIFT_MACARONS.ingredients
    ]);
    cookingState.addIngredients(ingsForMacaronsAndFlan);

    cookingState.cook(false);

    const result = cookingState.results(1);

    expect(result.dessert.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
      [
        "FLOWER_GIFT_MACARONS",
      ]
    `);
  });

  it('shall fallback to mixed meal if team cant cook', () => {
    const cookingState = new CookingState(
      mocks.teamSettingsExt({ camp: true }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    cookingState.cook(false);

    const result = cookingState.results(1);
    expect(result.dessert.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "MIXED_JUICE",
]
`);
    expect(result.curry.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "MIXED_CURRY",
]
`);
    expect(result.salad.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "MIXED_SALAD",
]
`);
  });

  it('shall cook mixed meal if team cant cook better', () => {
    const cookingState = new CookingState(
      mocks.teamSettingsExt({ camp: true }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    cookingState.addIngredients(ingredientSetToFloatFlat([{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }]));

    cookingState.cook(false);

    const result = cookingState.results(1);
    expect(result.curry.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "MIXED_CURRY",
]
`);
    expect(result.salad.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "MIXED_SALAD",
]
`);
    expect(result.dessert.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "MIXED_JUICE",
]
`);
  });

  it('shall crit with max bonus on sunday', () => {
    const cookingState = new CookingState(
      mocks.teamSettingsExt({ camp: true, potSize: MAX_POT_SIZE }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    cookingState.addIngredients(ingredientSetToFloatFlat(dessert.FLOWER_GIFT_MACARONS.ingredients));
    cookingState.addCritBonus(0.7);
    cookingState.cook(true);

    const result = cookingState.results(1);
    expect(result.dessert.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "FLOWER_GIFT_MACARONS",
]
`);
    expect(result.dessert.weeklyStrength).toEqual(dessert.FLOWER_GIFT_MACARONS.valueMax * 3);
    expect(result.dessert.sundayStrength).toEqual(dessert.FLOWER_GIFT_MACARONS.valueMax * 3);
  });

  it('shall be able to cook macarons with pot skill proc', () => {
    const cookingState = new CookingState(
      mocks.teamSettingsExt({ camp: true, potSize: MAX_POT_SIZE }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    cookingState.addIngredients(ingredientSetToFloatFlat(dessert.FLOWER_GIFT_MACARONS.ingredients));
    cookingState.addPotSize(30);
    cookingState.cook(false);

    const result = cookingState.results(1);
    expect(result.dessert.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
[
  "FLOWER_GIFT_MACARONS",
]
`);
  });
  it('shall reset stockpiles at the start of a new week', () => {
    const initialStockpile = ingredientSetToFloatFlat([
      { amount: 10, ingredient: ingredient.SLOWPOKE_TAIL },
      { amount: 5, ingredient: ingredient.BEAN_SAUSAGE }
    ]);
    const cookingState = new CookingState(
      mocks.teamSettingsExt({ camp: true, stockpiledIngredients: initialStockpile }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    cookingState.addIngredients(ingredientSetToFloatFlat([{ amount: 5, ingredient: ingredient.SLOWPOKE_TAIL }]));
    cookingState.cook(false);
    cookingState['currentDessertStockpile'] = emptyIngredientInventoryFloat();

    expect(cookingState['currentDessertStockpile']).not.toEqual(initialStockpile);

    cookingState.startNewWeek();

    expect(cookingState['currentDessertStockpile']).toEqual(initialStockpile);
  });

  it('shall cook a planned recipe early and add only unreserved filler value after recipe strength', () => {
    const cookingState = new CookingState(
      mocks.teamSettingsExt({
        potSize: 20,
        recipeType: 'dessert',
        mealPlan: {
          breakfast: { kind: 'recipe', recipe: dessert.WARM_MOOMOO_MILK.name },
          lunch: { kind: 'best' },
          dinner: { kind: 'best' }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    cookingState.addIngredients(
      ingredientSetToFloatFlat([
        ...dessert.WARM_MOOMOO_MILK.ingredients,
        { amount: 5, ingredient: ingredient.SLOWPOKE_TAIL }
      ])
    );

    expect(cookingState.cookPlannedMeal({ meal: 'breakfast', finalAttempt: false, sunday: false })).toBe(true);

    const result = cookingState.results(1);
    expect(result.dessert.weeklyStrength).toBe(
      dessert.WARM_MOOMOO_MILK.value * recipeLevelBonus[60] + 5 * ingredient.SLOWPOKE_TAIL.value
    );
    expect(result.dessert.cookedRecipes[0].averageFillerValue).toBe(5 * ingredient.SLOWPOKE_TAIL.value);
    expect(result.dessert.cookedRecipes[0].isPlannedRecipe).toBe(true);
  });

  it('shall use the Sunday meal plan only on Sunday', () => {
    const cookingState = new CookingState(
      mocks.teamSettingsExt({
        recipeType: 'dessert',
        mealPlan: {
          ...defaultMealPlan(),
          sunday: {
            breakfast: { kind: 'recipe', recipe: dessert.WARM_MOOMOO_MILK.name },
            lunch: { kind: 'best' },
            dinner: { kind: 'best' }
          }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );

    expect(cookingState.hasMealPlan(false)).toBe(false);
    expect(cookingState.hasMealPlan(true)).toBe(true);
  });

  it('shall allow weekday Best Recipe meals to use only Sunday ingredient surplus', () => {
    const cookingState = new CookingState(
      mocks.teamSettingsExt({
        recipeType: 'dessert',
        mealPlan: {
          ...defaultMealPlan(),
          sunday: {
            breakfast: { kind: 'recipe', recipe: dessert.FANCY_APPLE_JUICE.name },
            lunch: { kind: 'best' },
            dinner: { kind: 'best' }
          }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    cookingState.addIngredients(ingredientSetToFloatFlat([{ amount: 16, ingredient: ingredient.FANCY_APPLE }]));

    expect(cookingState.cookPlannedMeal({ meal: 'breakfast', finalAttempt: true, sunday: false })).toBe(true);
    expect(cookingState.results(1).dessert.cookedRecipes[0].recipe.name).toBe(dessert.FANCY_APPLE_JUICE.name);
  });

  it('shall not spend ingredients reserved by weekday planned meals on Best Recipe meals', () => {
    const cookingState = new CookingState(
      mocks.teamSettingsExt({
        recipeType: 'dessert',
        mealPlan: {
          breakfast: { kind: 'best' },
          lunch: { kind: 'recipe', recipe: dessert.FANCY_APPLE_JUICE.name },
          dinner: { kind: 'best' }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    cookingState.addIngredients(ingredientSetToFloatFlat([{ amount: 16, ingredient: ingredient.FANCY_APPLE }]));

    expect(cookingState.cookPlannedMeal({ meal: 'breakfast', finalAttempt: true, sunday: false })).toBe(true);
    expect(cookingState.results(1).dessert.cookedRecipes[0].recipe.name).toBe(dessert.MIXED_JUICE.name);
  });

  it('shall skip None meals without consuming a pot-size bonus', () => {
    const cookingState = new CookingState(
      mocks.teamSettingsExt({
        recipeType: 'dessert',
        mealPlan: {
          breakfast: { kind: 'none' },
          lunch: { kind: 'best' },
          dinner: { kind: 'best' }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    cookingState.addPotSize(10);

    expect(cookingState.cookPlannedMeal({ meal: 'breakfast', finalAttempt: true, sunday: false })).toBe(false);
    expect(cookingState['bonusPotSize']).toBe(10);
  });

  it('shall exclude ingredients reserved for planned recipes from deadline fallback recipes', () => {
    const cookingState = new CookingState(
      mocks.teamSettingsExt({
        recipeType: 'dessert',
        mealPlan: {
          breakfast: { kind: 'recipe', recipe: dessert.CRAFT_SODA_POP.name },
          lunch: { kind: 'best' },
          dinner: { kind: 'best' }
        }
      }),
      defaultUserRecipes(),
      noCritRandom()
    );
    cookingState.addIngredients(ingredientSetToFloatFlat(dessert.FANCY_APPLE_JUICE.ingredients));

    expect(cookingState.cookPlannedMeal({ meal: 'breakfast', finalAttempt: true, sunday: false })).toBe(true);
    const cookedRecipe = cookingState.results(1).dessert.cookedRecipes[0];
    expect(cookedRecipe.recipe.name).toBe(dessert.FANCY_APPLE_JUICE.name);
    expect(cookedRecipe.averageFillerValue).toBe(0);
    expect(cookedRecipe.isPlannedRecipe).toBe(false);
  });
});
