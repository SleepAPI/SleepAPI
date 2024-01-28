import { PokemonError } from '@src/domain/error/pokemon/pokemon-error';
import { pokemon } from 'sleepapi-common';
import { getBerriesForFilter } from '../berry-utils/berry-utils';

export function getPokemon(name: string): pokemon.Pokemon {
  const pkmn = pokemon.COMPLETE_POKEDEX.find((pokemon) => pokemon.name.toLowerCase() === name.toLowerCase());
  if (!pkmn) {
    throw new PokemonError(`Can't find Pokemon with name ${name}`);
  }
  return pkmn;
}

export function getPokemonNames(islands: { cyan: boolean; taupe: boolean; snowdrop: boolean; lapis: boolean }) {
  const allowedBerries = getBerriesForFilter(islands);
  return pokemon.COMPLETE_POKEDEX.filter((pokemon) => allowedBerries.includes(pokemon.berry)).map(
    (pokemon) => pokemon.name
  );
}
