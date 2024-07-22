import { MathUtils } from 'src/utils/math-utils';
import { INGREDIENTS, Ingredient } from '../../domain/ingredient';
import { IngredientSet } from '../../domain/types/ingredient-set';

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

/**
 * Combines same ingredients in drop, for example [2 honey, 4 honey, 5 milk] becomes [6 honey, 5 milk]
 */
export function combineSameIngredientsInDrop(ingredients: IngredientSet[]): IngredientSet[] {
  const combined = new Map<string, IngredientSet>();

  for (const drop of ingredients) {
    const { name } = drop.ingredient;
    const existingDrop = combined.get(name);

    if (existingDrop) {
      existingDrop.amount += drop.amount;
    } else {
      combined.set(name, { ...drop });
    }
  }

  return Array.from(combined.values());
}

export function shortPrettifyIngredientDrop(ingredientDrop: IngredientSet[]) {
  return ingredientDrop.map(({ ingredient }) => `${ingredient.name}`).join('/');
}

export function prettifyIngredientDrop(ingredientDrop: IngredientSet[], providedSeparator?: string) {
  const separator = providedSeparator ?? ', ';
  if (ingredientDrop.length >= INGREDIENTS.length) {
    const ingMagnetAmount = ingredientDrop.reduce(
      (min, cur) => (cur.amount < min ? cur.amount : min),
      ingredientDrop[0].amount,
    );

    const nonIngMagnetIngs = ingredientDrop.filter((ing) => ing.amount !== ingMagnetAmount);

    if (nonIngMagnetIngs.length > 0) {
      const prettyString = nonIngMagnetIngs
        .map(({ amount, ingredient }) => `${MathUtils.round(amount, 1)} ${ingredient.name}`)
        .join(separator);
      return `${prettyString} and ${MathUtils.round(ingMagnetAmount, 2)} of all ${
        INGREDIENTS.length - new Set(nonIngMagnetIngs.map((ing) => ing.ingredient.name)).size
      } other ingredients`;
    } else {
      return `${MathUtils.round(ingMagnetAmount, 2)} of all ${INGREDIENTS.length} ingredients`;
    }
  } else {
    return ingredientDrop
      .map(({ amount, ingredient }) => `${MathUtils.round(amount, 1)} ${ingredient.name}`)
      .join(separator);
  }
}
