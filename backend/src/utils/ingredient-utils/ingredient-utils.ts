import { IngredientError } from '../../domain/error/ingredient/ingredient-error';
import { INGREDIENTS, Ingredient } from '../../domain/produce/ingredient';

export function getIngredientForname(name: string): Ingredient {
  const ingredient = INGREDIENTS.find((ing) => ing.name.toLowerCase() === name.toLowerCase());
  if (!ingredient) {
    throw new IngredientError(`Ingredient with name [${name}] does not exist`);
  }
  return ingredient;
}

export function getIngredientNames(): string[] {
  return INGREDIENTS.map((ing) => ing.name);
}
