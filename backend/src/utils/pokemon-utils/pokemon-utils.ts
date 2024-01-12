import { OPTIMAL_POKEDEX, Pokemon } from '../../domain/pokemon/pokemon';
import { getBerriesForFilter } from '../berry-utils/berry-utils';

export function getPokemonForName(name: string): Pokemon {
  const pokemon = OPTIMAL_POKEDEX.find((pokemon) => pokemon.name === name);
  if (!pokemon) {
    throw new Error(`Programmer error: Can't find Pokemon coming from DB with name ${name}`);
  }
  return pokemon;
}

export function getPokemonNames(islands: { cyan: boolean; taupe: boolean; snowdrop: boolean; lapis: boolean }) {
  const allowedBerries = getBerriesForFilter(islands);
  return OPTIMAL_POKEDEX.filter((pokemon) => allowedBerries.includes(pokemon.berry)).map((pokemon) => pokemon.name);
}
