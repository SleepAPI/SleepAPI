import { IngredientIndexToAmount, PokemonWithIngredientsIndexed } from 'sleepapi-common';

export interface SetCoverPokemonSetup {
  pokemonSet: PokemonWithIngredientsIndexed;
  totalIngredients: IngredientIndexToAmount;
}

export interface MemoizedParameters {
  remainingIngredients: IngredientIndexToAmount;
  spotsLeftInTeam: number;
}

export class SetCover {
  // TODO: make sure reverseIndex is sorted by amount DESC
  // TODO: make sure that if index N in reverseIndex solves it, but N+1 does not we can break, because DESC will only get worse

  // TODO: we should be able to direct lookup ingredients since each ingredient comes with an index now
  // TODO: arrays should be MUCH better for memory

  // TODO: when creating the array we can set with specific size for optim, like new Array(TOTAL_INGS_LENGTH)
  // TODO: IMPORTANT; if we pre-determine length of array we must do +1 for the depth number
  #reverseIndex: Array<SetCoverPokemonSetup>;

  // TODO: Can we do something smart for the memo as well?

  // TODO: We could insert depth (or spotsLeftInTeam) at IngredientIndexToAmount[TOTAL_INGS_LENGTH+1]
  // TODO: So last index + 1, after ingredients

  // TODO: Look into WeakMap

  // TODO: Maybe string as king and just do ingredientsWithDepth.join(",")?

  // TODO: Maybe we could implement some type of number hashing like this.
  // TODO: it would need to be vital that two different inputs cant calc to same integer
  //   function hashFloat32Array(arr: Float32Array): number {
  //     let hash = 2166136261; // FNV-1a hash seed
  //     for (let i = 0; i < arr.length; i++) { // TODO: arr.length should just be 19 I guess, we can use a cached length
  //         hash ^= arr[i]; // XOR with the float value
  //         hash = (hash * 16777619) | 0; // Prime multiplier (FNV magic number)
  //     }
  //     return hash >>> 0; // Ensure positive 32-bit unsigned integer
  // }
  // #memo: Map<number, SetCoverPokemonSetup[][]>

  // TODO: Can we parallelize recursive calls with worker_threads?

  // TODO: Instead of using Float32Array as the param and cache key basis, we could use flat INT array which would probably lead to significantly more cache hits

  constructor() {
    //
  }
}
