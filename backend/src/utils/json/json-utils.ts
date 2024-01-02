import { IngredientDrop } from '../../domain/produce/ingredient';
import { roundDown } from '../calculator-utils/calculator-utils';

export function shortPrettifyIngredientDrop(ingredientDrop: IngredientDrop[]) {
  return ingredientDrop.map(({ amount, ingredient }) => `${ingredient.name}`).join('/');
}

export function prettifyIngredientDrop(ingredientDrop: IngredientDrop[], providedSeparator?: string) {
  const separator = providedSeparator ?? ', ';
  return ingredientDrop.map(({ amount, ingredient }) => `${roundDown(amount, 1)} ${ingredient.name}`).join(separator);
}
