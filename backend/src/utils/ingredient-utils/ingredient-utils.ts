import { INGREDIENTS, Ingredient } from '../../domain/produce/ingredient';

export function getIngredientForname(name: string): Ingredient {
  const ingredient = INGREDIENTS.find((ing) => ing.name.toLowerCase() === name.toLowerCase());
  if (!ingredient) {
    throw new Error(`Ingredient with name [${name}] does not exist`);
  }
  return ingredient;
}
