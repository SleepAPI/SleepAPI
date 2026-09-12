import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { defaultUserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';
import { mocks } from '@src/vitest/index.js';

export function cookingState(provided?: CookingState): CookingState {
  return provided ?? new CookingState(mocks.teamSettings(), defaultUserRecipes(), createPreGeneratedRandom());
}
