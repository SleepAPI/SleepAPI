import { PokemonError } from '../../domain/error/pokemon/pokemon-error';
import { COMPLETE_POKEDEX, Pokemon } from '../../domain/pokemon/pokemon';
import { getBerriesForFilter } from '../berry-utils/berry-utils';

export function getPokemon(name: string): Pokemon {
  const pokemon = COMPLETE_POKEDEX.find((pokemon) => pokemon.name.toLowerCase() === name.toLowerCase());
  if (!pokemon) {
    throw new PokemonError(`Can't find Pokemon with name ${name}`);
  }
  return pokemon;
}

export function getPokemonNames(islands: { cyan: boolean; taupe: boolean; snowdrop: boolean; lapis: boolean }) {
  const allowedBerries = getBerriesForFilter(islands);
  return COMPLETE_POKEDEX.filter((pokemon) => allowedBerries.includes(pokemon.berry)).map((pokemon) => pokemon.name);
}
