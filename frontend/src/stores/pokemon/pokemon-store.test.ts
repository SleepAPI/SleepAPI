import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { createPinia, setActivePinia } from 'pinia'
import type { PokemonInstanceExt } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Pokemon Store', () => {
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
    const pokemon = { externalId: '1', name: 'Pikachu' } as PokemonInstanceExt

    pokemonStore.upsertPokemon(pokemon)

    expect(pokemonStore.pokemon).toEqual({
      '1': pokemon
    })
  })

  it('should update an existing pokemon correctly', () => {
    const pokemonStore = usePokemonStore()
    const pokemon = { externalId: '1', name: 'Pikachu' } as PokemonInstanceExt

    pokemonStore.upsertPokemon(pokemon)

    const updatedPokemon = { externalId: '1', name: 'Raichu' } as PokemonInstanceExt
    pokemonStore.upsertPokemon(updatedPokemon)

    expect(pokemonStore.pokemon).toEqual({
      '1': updatedPokemon
    })
  })

  it('should remove a pokemon correctly', () => {
    const pokemonStore = usePokemonStore()
    const pokemon = { externalId: '1', name: 'Pikachu' } as PokemonInstanceExt

    pokemonStore.upsertPokemon(pokemon)
    expect(pokemonStore.pokemon).toEqual({
      '1': pokemon
    })

    pokemonStore.removePokemon('1')
    expect(pokemonStore.pokemon).toEqual({})
  })

  it('should get a pokemon by externalId correctly', () => {
    const pokemonStore = usePokemonStore()
    const pokemon = { externalId: '1', name: 'Pikachu' } as PokemonInstanceExt

    pokemonStore.upsertPokemon(pokemon)

    const retrievedPokemon = pokemonStore.getPokemon('1')
    expect(retrievedPokemon).toEqual(pokemon)
  })

  it('should return undefined for a non-existent pokemon', () => {
    const pokemonStore = usePokemonStore()

    const retrievedPokemon = pokemonStore.getPokemon('non-existent-id')
    expect(retrievedPokemon).toBeUndefined()
  })
})
