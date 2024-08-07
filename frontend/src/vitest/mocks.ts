import { ingredient, nature, pokemon, type PokemonInstanceExt } from 'sleepapi-common'

export function createMockPokemon(attrs?: Partial<PokemonInstanceExt>): PokemonInstanceExt {
  return {
    name: 'Bubbles',
    externalId: 'external-id',
    pokemon: pokemon.PIKACHU,
    carrySize: 10,
    ingredients: [{ level: 1, ingredient: ingredient.FANCY_APPLE }],
    level: 10,
    ribbon: 0,
    nature: nature.BASHFUL,
    saved: false,
    shiny: false,
    skillLevel: 1,
    subskills: [],
    version: 1,
    ...attrs
  }
}
