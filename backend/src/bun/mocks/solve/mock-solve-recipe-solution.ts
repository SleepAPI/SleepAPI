import { setCoverPokemonWithSettings } from '@src/bun/mocks/solve/mock-set-cover-pokemon-with-settings.js';
import type { SolveRecipeSolution, SolveRecipeSolutionWithSettings } from '@src/services/solve/types/solution-types.js';
import { mockIngredientSetIntIndexed } from 'sleepapi-common';

export function solveRecipeSolution(attrs?: Partial<SolveRecipeSolution>): SolveRecipeSolution {
  return {
    members: [setCoverPokemonWithSettings()],
    producedIngredients: mockIngredientSetIntIndexed(),
    ...attrs
  };
}

export function solveRecipeSolutionWithSettings(
  attrs?: Partial<SolveRecipeSolutionWithSettings>
): SolveRecipeSolutionWithSettings {
  return {
    members: [setCoverPokemonWithSettings()],
    producedIngredients: mockIngredientSetIntIndexed(),
    ...attrs
  };
}
