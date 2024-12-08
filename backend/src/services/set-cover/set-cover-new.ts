import { IngredientIndexToIntAmount, PokemonWithIngredientsIndexed, SolveRecipeResponse } from 'sleepapi-common';

// TODO decide if we go with int or float, if float then remove Int16 everywhere for consistency
export interface SetCoverPokemonSetup {
  pokemonSet: PokemonWithIngredientsIndexed;
  totalIngredients: IngredientIndexToIntAmount;
}

export interface MemoizedParameters {
  remainingIngredients: IngredientIndexToIntAmount;
  spotsLeftInTeam: number;
}

// TODO: Can we parallelize recursive calls with worker_threads?

export class SetCover {
  // TODO: make sure reverseIndex is sorted by amount DESC
  // TODO: make sure that if index N in reverseIndex solves it, but N+1 does not we can break, because DESC will only get worse

  // TODO: we should be able to direct lookup ingredients since each ingredient comes with an index now
  // TODO: arrays should be MUCH better for memory

  // TODO: when creating the array we can set with specific size for optim, like new Array(TOTAL_INGS_LENGTH)
  // TODO: IMPORTANT; if we pre-determine length of array we must do +1 for the depth number
  #producersByIngredientIndex: Array<SetCoverPokemonSetup>;

  // TODO: We could insert depth (or spotsLeftInTeam) at IngredientIndexToAmount[TOTAL_INGS_LENGTH+1]
  // TODO: So last index + 1, after ingredients

  // TODO: Maybe string as king and just do ingredientsWithDepth.join(",")?

  // TODO: for set cover maybe we change SetCoverPokemonSetup producedIngs to int with ceil?
  #cachedSubRecipeSolves: Map<number, SetCoverPokemonSetup[][]>;

  #startTime: number = Date.now();
  #timeout = 10000;

  // FIXME impl
  constructor(
    producersByIngredientIndex: Array<SetCoverPokemonSetup>,
    cachedSubRecipeSolves: Map<number, SetCoverPokemonSetup[][]>
  ) {
    this.#producersByIngredientIndex = producersByIngredientIndex;
    this.#cachedSubRecipeSolves = cachedSubRecipeSolves;
  }

  public solve(subRecipe: IngredientIndexToIntAmount): SetCoverPokemonSetup[][] {
    //
  }

  // TODO: do we need starting pokemon? we should just be able to pre calc and lower team size
  public solveRecipe(recipe: IngredientIndexToIntAmount, maxTeamSize: number): SolveRecipeResponse {
    //
  }

  // TEST
  // FIXME comments, maybe move out?
  private createMemoKey(arr: Int16Array): number {
    let hash = 2166136261; // FNV-1a hash seed
    for (let i = 0; i < arr.length; i++) {
      // XOR with the current integer value, cast to 32-bit to avoid sign-extension issues
      hash ^= arr[i] & 0xffff; // Mask with 0xffff to handle the 16-bit integer properly
      hash = (hash * 16777619) | 0; // Multiply by the FNV prime, keeping within 32-bit range
    }
    return hash >>> 0; // Ensure the result is a positive 32-bit unsigned integer
  }
}
