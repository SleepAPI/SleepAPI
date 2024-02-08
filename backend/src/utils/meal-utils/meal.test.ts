import { recipe } from 'sleepapi-common';
describe('MEALS', () => {
  it.each(recipe.RECIPES)('meal "%s" shall match nrOfIngredients with summed amounts', (meal: recipe.Recipe) => {
    const summedAmount = meal.ingredients.reduce((sum, cur) => sum + cur.amount, 0);
    expect(summedAmount).toBe(meal.nrOfIngredients);
  });
});
