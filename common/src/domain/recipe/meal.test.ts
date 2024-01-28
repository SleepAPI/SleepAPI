import { RECIPES, Recipe } from './recipe';

describe('MEALS', () => {
  it.each(RECIPES)('meal "%s" shall match nrOfIngredients with summed amounts', (meal: Recipe) => {
    const summedAmount = meal.ingredients.reduce((sum, cur) => sum + cur.amount, 0);
    expect(summedAmount).toBe(meal.nrOfIngredients);
  });
});
