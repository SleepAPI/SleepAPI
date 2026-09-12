import { getBerriesForFilter } from '@src/utils/berry-utils/berry-utils.js';
import { COMPLETE_POKEDEX } from 'sleepapi-common';

/**
 * For the SleepAPI team finder, this filters the Pokedex for only Pokemon with a berry that's favoured on one of the selected islands.
 * As this is only used for SleepAPI, it doesn't need any more unit tests.
 */
export function getPokemonNames(islands: {
  cyan: boolean;
  taupe: boolean;
  snowdrop: boolean;
  lapis: boolean;
  powerplant: boolean;
  amber: boolean;
}) {
  const allowedBerries = getBerriesForFilter(islands);
  return COMPLETE_POKEDEX.filter((pokemon) => allowedBerries.includes(pokemon.berry)).map((pokemon) => pokemon.name);
}
