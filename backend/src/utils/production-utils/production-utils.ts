import { PokemonError } from '@src/domain/error/pokemon/pokemon-error';
import { IngredientSet } from 'sleepapi-common';

export function chooseIngredientSets(validSets: IngredientSet[][], ingredientSet?: string[]): IngredientSet[][] {
  if (!ingredientSet) {
    return validSets;
  }

  const lowercaseIngredientSet = ingredientSet.map((ing) => ing.toLowerCase());

  for (const set of validSets) {
    if (
      set.length === lowercaseIngredientSet.length &&
      set.every(
        (ingredientDrop, index) => ingredientDrop.ingredient.name.toLowerCase() === lowercaseIngredientSet[index]
      )
    ) {
      return [set];
    }
  }

  throw new PokemonError(`Ingredient set [${ingredientSet.join(', ')}] was not valid`);
}
