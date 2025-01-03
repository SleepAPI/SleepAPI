import {
  solveRecipeSolution,
  solveRecipeSolutionWithSettings
} from '@src/bun/mocks/solve/mock-solve-recipe-solution.js';
import type { SolveRecipeResult, SolveRecipeResultWithSettings } from '@src/services/solve/types/solution-types.js';

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
