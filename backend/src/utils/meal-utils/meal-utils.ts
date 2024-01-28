import { recipe } from 'sleepapi-common';
import { MealError } from '../../domain/error/meal/meal-error';

export function getMeal(name: string) {
  const meal: recipe.Recipe | undefined = recipe.RECIPES.find((meal) => meal.name === name.toUpperCase());
  if (!meal) {
    throw new MealError("Couldn't find meal with name: " + name.toUpperCase());
  }
  return meal;
}

export function getMealsForFilter(params: {
  curry?: boolean;
  salad?: boolean;
  dessert?: boolean;
  minRecipeBonus?: number;
  maxPotSize?: number;
}) {
  const { curry = false, salad = false, dessert = false, minRecipeBonus = 0, maxPotSize } = params;
  let recipes = recipe.RECIPES;

  if (curry || salad || dessert) {
    recipes = recipes.filter(
      (meal) =>
        (meal.type === 'curry' && curry) || (meal.type === 'salad' && salad) || (meal.type === 'dessert' && dessert)
    );
  }
  const recipesWithBonus = recipes.filter((m) => m.bonus >= minRecipeBonus);

  return maxPotSize ? recipesWithBonus.filter((m) => m.nrOfIngredients <= maxPotSize) : recipesWithBonus;
}
