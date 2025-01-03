import { getBerriesForFilter } from '@src/utils/berry-utils/berry-utils.js';
import { COMPLETE_POKEDEX } from 'sleepapi-common';

export function getPokemonNames(islands: {
  cyan: boolean;
  taupe: boolean;
  snowdrop: boolean;
  lapis: boolean;
  powerplant: boolean;
}) {
  const allowedBerries = getBerriesForFilter(islands);
  return COMPLETE_POKEDEX.filter((pokemon) => allowedBerries.includes(pokemon.berry)).map((pokemon) => pokemon.name);
}
