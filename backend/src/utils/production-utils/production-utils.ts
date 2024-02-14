import { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom';
import { PokemonError } from '@src/domain/error/pokemon/pokemon-error';
import { ScheduledEvent } from '@src/domain/event/event';
import { berry } from 'sleepapi-common';

export function chooseIngredientSet(
  validSets: { pokemonProduction: CustomPokemonCombinationWithProduce; log: ScheduledEvent[] }[],
  ingredientSet: string[]
) {
  const lowercaseIngredientSet = ingredientSet.map((ing) => ing.toLowerCase());
  const productionForChosenIngSet = validSets.find((set) =>
    set.pokemonProduction.pokemonCombination.ingredientList.every(
      (ingredientDrop, index) => ingredientDrop.ingredient.name.toLowerCase() === lowercaseIngredientSet[index]
    )
  );

  if (!productionForChosenIngSet) {
    throw new PokemonError(`Ingredient set [${ingredientSet.join(', ')}] was not valid`);
  }

  return productionForChosenIngSet;
}

export function getEmptyProduce(berry: berry.Berry) {
  return {
    berries: { amount: 0, berry },
    ingredients: [],
  };
}
