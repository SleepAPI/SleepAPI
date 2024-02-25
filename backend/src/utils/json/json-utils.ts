import { IngredientSet, ingredient } from 'sleepapi-common';
import { roundDown } from '../calculator-utils/calculator-utils';

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

    let prettyString = nonIngMagnetIngs
      .map(({ amount, ingredient }) => `${roundDown(amount, 1)} ${ingredient.name}`)
      .join(separator);

    if (nonIngMagnetIngs.length > 0) {
      return (prettyString += ` and ${roundDown(ingMagnetAmount, 2)} of all ${
        ingredient.INGREDIENTS.length - new Set(nonIngMagnetIngs.map((ing) => ing.ingredient.name)).size
      } other ingredients`);
    } else {
      return `${roundDown(ingMagnetAmount, 2)} of all ${ingredient.INGREDIENTS.length} ingredients`;
    }
  } else {
    return ingredientDrop.map(({ amount, ingredient }) => `${roundDown(amount, 1)} ${ingredient.name}`).join(separator);
  }
}
