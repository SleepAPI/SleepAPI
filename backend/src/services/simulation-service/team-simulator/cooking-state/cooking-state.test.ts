import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { defaultUserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { mocks } from '@src/vitest/index.js';
import type { MealTimes } from 'sleepapi-common';
import {
  dessert,
  emptyIngredientInventoryFloat,
  ingredient,
  ingredientSetToFloatFlat,
  MAX_POT_SIZE,
  parseTime
} from 'sleepapi-common';
import { describe, expect, it } from 'vitest';

describe('CookingState', () => {
  it('shall include provided meal times in results', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({ camp: true }),
      defaultUserRecipes(),
      createPreGeneratedRandom()
    );

    const mealTimes: MealTimes = {
      breakfast: parseTime('08:00'),
      lunch: parseTime('14:00'),
      dinner: parseTime('20:00')
    };

    cookingState.setMealTimes(mealTimes);

    const result = cookingState.results(1);

    expect(result.mealTimes).toEqual(mealTimes);
  });

  it('shall cook the best recipe for which it has ingredients', () => {
    const cookingState = new CookingState(
      mocks.teamSettings({ camp: true, potSize: MAX_POT_SIZE }),
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
      mocks.teamSettings({ camp: true }),
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
      mocks.teamSettings({ camp: true }),
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
      mocks.teamSettings({ camp: true, potSize: MAX_POT_SIZE }),
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
      mocks.teamSettings({ camp: true, potSize: MAX_POT_SIZE }),
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
      mocks.teamSettings({ camp: true, stockpiledIngredients: initialStockpile }),
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
});
