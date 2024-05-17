import { MAX_RECIPE_LEVEL, RECIPES, Recipe, recipeLevelBonus } from 'sleepapi-common';
describe('MEALS', () => {
  it.each(RECIPES)('meal "%s" shall match nrOfIngredients with summed amounts', (meal: Recipe) => {
    const summedAmount = meal.ingredients.reduce((sum, cur) => sum + cur.amount, 0);
    expect(summedAmount).toBe(meal.nrOfIngredients);
  });

  it.each(RECIPES)('meal "%s" shall match ingredients with bonus and value', (meal: Recipe) => {
    const ingredientValue = meal.ingredients.reduce((sum, cur) => sum + cur.amount * cur.ingredient.value, 0);
    const ingsWithBonus = ingredientValue * (1 + meal.bonus / 100);
    expect(Math.abs(ingsWithBonus) - meal.value).toBeLessThanOrEqual(2);
    expect(Math.abs(ingsWithBonus * recipeLevelBonus[MAX_RECIPE_LEVEL] - meal.valueMax)).toBeLessThanOrEqual(2);
  });
});
