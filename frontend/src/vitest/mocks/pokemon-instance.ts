import { ingredient, nature, pokemon, type PokemonInstanceExt } from 'sleepapi-common'

export function createMockPokemon(attrs?: Partial<PokemonInstanceExt>): PokemonInstanceExt {
  return {
    name: 'Bubbles',
    externalId: 'external-id',
    pokemon: pokemon.PIKACHU,
    carrySize: 10,
    ingredients: [
      { level: 0, ingredient: ingredient.FANCY_APPLE },
      { level: 30, ingredient: ingredient.FANCY_APPLE },
      { level: 60, ingredient: ingredient.FANCY_APPLE }
    ],
    level: 10,
    ribbon: 0,
    nature: nature.BASHFUL,
    saved: false,
    shiny: false,
    gender: undefined,
    skillLevel: 1,
    subskills: [],
    version: 1,
    ...attrs
  }
}
