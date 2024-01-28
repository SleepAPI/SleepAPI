import { IngredientSet } from 'sleepapi-common';
import { roundDown } from '../calculator-utils/calculator-utils';

export function shortPrettifyIngredientDrop(ingredientDrop: IngredientSet[]) {
  return ingredientDrop.map(({ ingredient }) => `${ingredient.name}`).join('/');
}

export function prettifyIngredientDrop(ingredientDrop: IngredientSet[], providedSeparator?: string) {
  const separator = providedSeparator ?? ', ';
  return ingredientDrop.map(({ amount, ingredient }) => `${roundDown(amount, 1)} ${ingredient.name}`).join(separator);
}
