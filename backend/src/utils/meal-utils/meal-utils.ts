import { MealError } from '../../domain/error/meal/meal-error';
import { ADVANCED_MEALS, ADVANCED_UNLOCKED_MEALS, LATEGAME_MEALS, MEALS, Meal } from '../../domain/recipe/meal';

export function getMeal(name: string) {
  const meal: Meal | undefined = MEALS.find((meal) => meal.name === name.toUpperCase());
  if (!meal) {
    throw new MealError("Couldn't find meal with name: " + name.toUpperCase());
  }
  return meal;
}

export function getMealsForFilter(params: {
  advanced: boolean;
  unlocked: boolean;
  lategame: boolean;
  curry: boolean;
  salad: boolean;
  dessert: boolean;
}) {
  const { advanced, unlocked, lategame, curry, salad, dessert } = params;
  let meals = MEALS;
  if (lategame) {
    meals = LATEGAME_MEALS;
  } else if (unlocked) {
    meals = ADVANCED_UNLOCKED_MEALS;
  } else if (advanced) {
    meals = ADVANCED_MEALS;
  }

  if (curry || salad || dessert) {
    return meals.filter(
      (meal) =>
        (meal.type === 'curry' && curry) || (meal.type === 'salad' && salad) || (meal.type === 'dessert' && dessert)
    );
  } else {
    return meals;
  }
}

export function getMealsForFilterWithBonus(params: {
  minRecipeBonus: number;
  curry: boolean;
  salad: boolean;
  dessert: boolean;
}) {
  const { minRecipeBonus, curry, salad, dessert } = params;
  let meals = MEALS;

  if (curry || salad || dessert) {
    meals = meals.filter(
      (meal) =>
        (meal.type === 'curry' && curry) || (meal.type === 'salad' && salad) || (meal.type === 'dessert' && dessert)
    );
  }
  return meals.filter((m) => m.bonus >= minRecipeBonus);
}

export function getMealsAboveBonus(minBonus: number) {
  return MEALS.filter((m) => m.bonus >= minBonus);
}
