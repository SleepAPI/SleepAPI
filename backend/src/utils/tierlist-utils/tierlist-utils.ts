import type { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom.js';
import type { TieredPokemonCombinationContribution } from '@src/routes/tierlist-router/tierlist-router.js';
import { hashPokemonCombination } from '@src/utils/optimal-utils/optimal-utils.js';

export function diffTierlistRankings(
  current: TieredPokemonCombinationContribution[],
  previous?: TieredPokemonCombinationContribution[]
): TieredPokemonCombinationContribution[] {
  if (!previous) {
    return current;
  }

  const previousIndexMap = createPreviousIndexMap(previous);

  return current.map((currentEntry, currentIndex) =>
    calculateDiffForEntry(currentEntry, currentIndex, previousIndexMap)
  );
}

export function createPreviousIndexMap(previous: TieredPokemonCombinationContribution[]): Map<string, number> {
  const indexMap = new Map<string, number>();

  previous.forEach((entry, index) => {
    const hash = hashPokemonCombination(entry.pokemonCombinationContribution.pokemonCombination);
    indexMap.set(hash, index);
  });

  return indexMap;
}

export function calculateDiffForEntry(
  currentEntry: TieredPokemonCombinationContribution,
  currentIndex: number,
  previousIndexMap: Map<string, number>
): TieredPokemonCombinationContribution {
  const currentHash = hashPokemonCombination(currentEntry.pokemonCombinationContribution.pokemonCombination);
  const previousIndex = previousIndexMap.get(currentHash);

  if (previousIndex === undefined) {
    currentEntry.diff = undefined;
  } else {
    currentEntry.diff = previousIndex - currentIndex;
  }

  return currentEntry;
}

export function createProduceMap(defaultProduce: CustomPokemonCombinationWithProduce[]) {
  const map: Map<string, CustomPokemonCombinationWithProduce> = new Map();
  for (const pokemonWithProduce of defaultProduce) {
    const hashedPokemon = hashPokemonCombination(pokemonWithProduce.pokemonCombination);
    map.set(hashedPokemon, pokemonWithProduce);
  }
  return map;
}
