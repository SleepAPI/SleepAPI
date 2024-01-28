import { IngredientError } from '@src/domain/error/ingredient/ingredient-error';
import { ingredient } from 'sleepapi-common';

export function getIngredientForname(name: string): ingredient.Ingredient {
  const ing = ingredient.INGREDIENTS.find((ing) => ing.name.toLowerCase() === name.toLowerCase());
  if (!ing) {
    throw new IngredientError(`Ingredient with name [${name}] does not exist`);
  }
  return ing;
}

export function getIngredientNames(): string[] {
  return ingredient.INGREDIENTS.map((ing) => ing.name);
}
