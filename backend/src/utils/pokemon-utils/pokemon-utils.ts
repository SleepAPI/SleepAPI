import { pokemon } from 'sleepapi-common';
import { getBerriesForFilter } from '../berry-utils/berry-utils';

export function getPokemonNames(islands: { cyan: boolean; taupe: boolean; snowdrop: boolean; lapis: boolean }) {
  const allowedBerries = getBerriesForFilter(islands);
  return pokemon.COMPLETE_POKEDEX.filter((pokemon) => allowedBerries.includes(pokemon.berry)).map(
    (pokemon) => pokemon.name
  );
}
