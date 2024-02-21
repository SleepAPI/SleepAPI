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

    let prettyString = ingredientDrop
      .filter((ing) => ing.amount !== ingMagnetAmount)
      .map(({ amount, ingredient }) => `${roundDown(amount, 1)} ${ingredient.name}`)
      .join(separator);
    return (prettyString += ` and ${roundDown(ingMagnetAmount, 2)} of all other ingredients`);
  } else {
    return ingredientDrop.map(({ amount, ingredient }) => `${roundDown(amount, 1)} ${ingredient.name}`).join(separator);
  }
}
