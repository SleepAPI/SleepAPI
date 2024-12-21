import { SolveRecipeResult, SolveRecipeResultWithSettings } from '@src/services/solve/types/solution-types.js';
import {
  solveRecipeSolution,
  solveRecipeSolutionWithSettings
} from '@src/vitest/mocks/solve/mock-solve-recipe-solution.js';

export function solveRecipeResult(attrs?: Partial<SolveRecipeResult>): SolveRecipeResult {
  return {
    exhaustive: true,
    teams: [solveRecipeSolution()],
    ...attrs
  };
}

export function solveRecipeResultWithSettings(
  attrs?: Partial<SolveRecipeResultWithSettings>
): SolveRecipeResultWithSettings {
  return {
    exhaustive: true,
    teams: [solveRecipeSolutionWithSettings()],
    ...attrs
  };
}
