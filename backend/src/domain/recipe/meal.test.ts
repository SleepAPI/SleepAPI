import { MEALS, Meal } from './meal';

describe('MEALS', () => {
  it.each(MEALS)('meal "%s" shall match nrOfIngredients with summed amounts', (meal: Meal) => {
    const summedAmount = meal.ingredients.reduce((sum, cur) => sum + cur.amount, 0);
    expect(summedAmount).toBe(meal.nrOfIngredients);
  });
});
