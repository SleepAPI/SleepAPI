import { PokemonError } from '../../domain/error/pokemon/pokemon-error';
import { IngredientDrop } from '../../domain/produce/ingredient';

export function chooseIngredientSets(validSets: IngredientDrop[][], ingredientSet?: string[]): IngredientDrop[][] {
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
