import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { createPinia, setActivePinia } from 'pinia'
import { ingredient, nature, pokemon, type PokemonInstanceExt } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Pokemon Store', () => {
  const externalId = 'external-id'
  const mockPokemon: PokemonInstanceExt = {
    name: 'Bubbles',
    externalId,
    pokemon: pokemon.PIKACHU,
    carrySize: 10,
    ingredients: [{ level: 1, ingredient: ingredient.FANCY_APPLE }],
    level: 10,
    nature: nature.BASHFUL,
    saved: false,
    skillLevel: 1,
    subskills: [],
    version: 1
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have expected default state', () => {
    const pokemonStore = usePokemonStore()
    expect(pokemonStore.$state).toMatchInlineSnapshot(`
      {
        "pokemon": {},
      }
    `)
  })

  it('should upsert a pokemon correctly', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertPokemon(mockPokemon)

    expect(pokemonStore.pokemon).toEqual({
      'external-id': mockPokemon
    })
  })

  it('should update an existing pokemon correctly', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertPokemon(mockPokemon)

    const updatedPokemon = { ...mockPokemon, name: 'Raichu' }
    pokemonStore.upsertPokemon(updatedPokemon)

    expect(pokemonStore.pokemon).toEqual({
      'external-id': updatedPokemon
    })
  })

  it('should remove a pokemon correctly', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertPokemon(mockPokemon)

    expect(pokemonStore.pokemon).toEqual({
      'external-id': mockPokemon
    })

    pokemonStore.removePokemon(externalId)
    expect(pokemonStore.pokemon).toEqual({})
  })

  it('should get a pokemon by externalId correctly', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertPokemon(mockPokemon)

    const retrievedPokemon = pokemonStore.getPokemon(externalId)
    expect(retrievedPokemon).toEqual(mockPokemon)
  })

  it('should return undefined for a non-existent pokemon', () => {
    const pokemonStore = usePokemonStore()

    const retrievedPokemon = pokemonStore.getPokemon('non-existent-id')
    expect(retrievedPokemon).toBeUndefined()
  })
})
