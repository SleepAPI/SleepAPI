import { CarrySizeUtils, ingredient, nature, PIKACHU, type PokemonInstance } from 'sleepapi-common'

export function createMockPokemon(attrs?: Partial<PokemonInstance>): PokemonInstance {
  return {
    name: 'Bubbles',
    externalId: 'external-id',
    pokemon: PIKACHU,
    carrySize: CarrySizeUtils.baseCarrySize(PIKACHU),
    ingredients: [
      { level: 0, ingredient: ingredient.FANCY_APPLE, amount: 2 },
      { level: 30, ingredient: ingredient.FANCY_APPLE, amount: 5 },
      { level: 60, ingredient: ingredient.FANCY_APPLE, amount: 7 }
    ],
    level: 10,
    ribbon: 0,
    nature: nature.BASHFUL,
    saved: false,
    shiny: false,
    gender: undefined,
    skillLevel: 1,
    subskills: [],
    sneakySnacking: false,
    version: 1,
    rp: 0,
    ...attrs
  }
}
