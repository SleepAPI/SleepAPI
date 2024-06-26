import { IngredientSet, MathUtils, ingredient } from 'sleepapi-common';

export function shortPrettifyIngredientDrop(ingredientDrop: IngredientSet[]) {
  return ingredientDrop.map(({ ingredient }) => `${ingredient.name}`).join('/');
}

export function prettifyIngredientDrop(ingredientDrop: IngredientSet[], providedSeparator?: string) {
  const separator = providedSeparator ?? ', ';
  if (ingredientDrop.length >= ingredient.INGREDIENTS.length) {
    const ingMagnetAmount = ingredientDrop.reduce(
      (min, cur) => (cur.amount < min ? cur.amount : min),
      ingredientDrop[0].amount
    );

    const nonIngMagnetIngs = ingredientDrop.filter((ing) => ing.amount !== ingMagnetAmount);

    if (nonIngMagnetIngs.length > 0) {
      const prettyString = nonIngMagnetIngs
        .map(({ amount, ingredient }) => `${MathUtils.round(amount, 1)} ${ingredient.name}`)
        .join(separator);
      return `${prettyString} and ${MathUtils.round(ingMagnetAmount, 2)} of all ${
        ingredient.INGREDIENTS.length - new Set(nonIngMagnetIngs.map((ing) => ing.ingredient.name)).size
      } other ingredients`;
    } else {
      return `${MathUtils.round(ingMagnetAmount, 2)} of all ${ingredient.INGREDIENTS.length} ingredients`;
    }
  } else {
    return ingredientDrop
      .map(({ amount, ingredient }) => `${MathUtils.round(amount, 1)} ${ingredient.name}`)
      .join(separator);
  }
}
