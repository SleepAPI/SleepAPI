export function generateAllBuddyCombinations(
  pokemonCombinations: {
    id: number;
    ingredient0: string;
    ingredient30: string;
    ingredient60?: string;
    produced_amount0: number;
    produced_amount30: number;
    produced_amount60?: number;
  }[]
) {
  const arr1 = pokemonCombinations;
  const result = [];

  for (let i = 0, len1 = arr1.length; i < len1; i++) {
    for (let j = 0, len2 = arr1.slice(i, arr1.length).length; j < len2; j++) {
      result.push({
        buddy1: {
          id: arr1[i].id,
          ingredient0: arr1[i].ingredient0,
          ingredient30: arr1[i].ingredient30,
          ingredient60: arr1[i].ingredient60,
          produced_amount0: arr1[i].produced_amount0,
          produced_amount30: arr1[i].produced_amount30,
          produced_amount60: arr1[i].produced_amount60,
        },
        buddy2: {
          id: arr1[i + j].id,
          ingredient0: arr1[i + j].ingredient0,
          ingredient30: arr1[i + j].ingredient30,
          ingredient60: arr1[i + j].ingredient60,
          produced_amount0: arr1[i + j].produced_amount0,
          produced_amount30: arr1[i + j].produced_amount30,
          produced_amount60: arr1[i + j].produced_amount60,
        },
      });
    }
  }

  return result;
}
