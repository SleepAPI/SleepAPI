import { PokemonError } from '@src/domain/error/pokemon/pokemon-error.js';
import type { IngredientSet } from 'sleepapi-common';

export function getIngredientSet(validSets: IngredientSet[][], ingredientSet: string[]): IngredientSet[] {
  const lowercaseIngredientSet = ingredientSet.map((ing) => ing.toLowerCase());
  const foundIngredientSet = validSets.find((set) =>
    set.every((ingredientDrop, index) => ingredientDrop.ingredient.name.toLowerCase() === lowercaseIngredientSet[index])
  );

  if (!foundIngredientSet) {
    throw new PokemonError(`Ingredient set [${ingredientSet.join(', ')}] was not valid`);
  }

  return foundIngredientSet;
}
