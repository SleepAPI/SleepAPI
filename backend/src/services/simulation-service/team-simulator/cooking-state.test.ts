// TODO: test mixed meals if team cant make

import { combineIngredientDrops } from '@src/services/calculator/ingredient/ingredient-calculate';
import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state';
import { dessert, ingredient } from 'sleepapi-common';

describe('CookingState', () => {
  it('shall cook the best recipe for which it has ingredients', () => {
    const cookingState = new CookingState(true);

    const ingsForMacaronsAndFlan = combineIngredientDrops(
      dessert.JIGGLYPUFFS_FRUITY_FLAN.ingredients,
      dessert.FLOWER_GIFT_MACARONS.ingredients
    );
    cookingState.addIngredients(ingsForMacaronsAndFlan);

    cookingState.cook(false);

    const result = cookingState.results(1);
    expect(result.dessert.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
      [
        "FLOWER_GIFT_MACARONS",
      ]
    `);
  });

  it('shall cook mixed meal if team cant cook better', () => {
    const cookingState = new CookingState(true);

    cookingState.addIngredients([{ amount: 1, ingredient: ingredient.SLOWPOKE_TAIL }]);

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
    const cookingState = new CookingState(true);

    cookingState.addIngredients(dessert.FLOWER_GIFT_MACARONS.ingredients);
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
    const cookingState = new CookingState(true);

    cookingState.addIngredients(dessert.FLOWER_GIFT_MACARONS.ingredients);
    cookingState.addPotSize(30);
    cookingState.cook(false);

    const result = cookingState.results(1);
    expect(result.dessert.cookedRecipes.map((r) => r.recipe.name)).toMatchInlineSnapshot(`
      [
        "FLOWER_GIFT_MACARONS",
      ]
    `);
  });
});
