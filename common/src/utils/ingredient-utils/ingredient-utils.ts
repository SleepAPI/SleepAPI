import { INGREDIENTS, Ingredient } from '../../domain/ingredient';

export function getIngredient(name: string): Ingredient {
  const ing = INGREDIENTS.find((ing) => ing.name.toLowerCase() === name.toLowerCase());
  if (!ing) {
    throw new Error(`Ingredient with name [${name}] does not exist`);
  }
  return ing;
}

export function getIngredientNames(): string[] {
  return INGREDIENTS.map((ing) => ing.name);
}
