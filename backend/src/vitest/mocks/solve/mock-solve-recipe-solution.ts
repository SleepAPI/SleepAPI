import { SolveRecipeSolution, SolveRecipeSolutionWithSettings } from '@src/services/solve/types/solution-types.js';
import { mockIngredientSetIntIndexed } from '@src/vitest/mocks/ingredient/mock-ingredient-set.js';
import { setCoverPokemonWithSettings } from '@src/vitest/mocks/solve/mock-set-cover-pokemon-with-settings.js';

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
