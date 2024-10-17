import { avatarImage, mainskillImage, pokemonImage } from '@/services/utils/image-utils'
import { berry, mainskill, pokemon } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

describe('mainskillImage', () => {
  it('returns correct image path for HELPER_BOOST skill', () => {
    const mockPokemon: pokemon.Pokemon = {
      ...pokemon.MOCK_POKEMON,
      berry: berry.LEPPA,
      skill: mainskill.HELPER_BOOST
    }

    const result = mainskillImage(mockPokemon)
    expect(result).toBe('/images/type/fire.png')
  })

  it('returns correct image path for stockpile skill', () => {
    const mockPokemon: pokemon.Pokemon = {
      ...pokemon.MOCK_POKEMON,
      skill: mainskill.STOCKPILE_CHARGE_STRENGTH_S
    }

    const result = mainskillImage(mockPokemon)
    expect(result).toBe('/images/mainskill/stockpile_strength.png')
  })

  it('returns correct image path for other skills', () => {
    const mockPokemon: pokemon.Pokemon = {
      ...pokemon.MOCK_POKEMON,
      skill: mainskill.CHARGE_ENERGY_S
    }

    const result = mainskillImage(mockPokemon)
    expect(result).toBe('/images/mainskill/energy.png')
  })
})

describe('pokemonImage', () => {
  it('shall return correct pokemon image', () => {
    expect(pokemonImage({ pokemonName: 'some-pokemon', shiny: false })).toEqual(
      '/images/pokemon/some-pokemon.png'
    )
  })

  it('shall return correct shiny pokemon image', () => {
    expect(pokemonImage({ pokemonName: 'some-pokemon', shiny: true })).toEqual(
      '/images/pokemon/some-pokemon_shiny.png'
    )
  })
})

describe('avatarImage', () => {
  it('shall return correct avatar image', () => {
    expect(avatarImage({ pokemonName: 'some-pokemon', shiny: false, happy: false })).toEqual(
      '/images/avatar/portrait/some-pokemon.png'
    )
  })
  it('shall return correct shiny avatar image', () => {
    expect(avatarImage({ pokemonName: 'some-pokemon', shiny: true, happy: false })).toEqual(
      '/images/avatar/portrait/some-pokemon_shiny.png'
    )
  })
  it('shall return correct happy avatar image', () => {
    expect(avatarImage({ pokemonName: 'some-pokemon', shiny: false, happy: true })).toEqual(
      '/images/avatar/happy/some-pokemon_happy.png'
    )
  })
  it('shall return correct shiny happy avatar image', () => {
    expect(avatarImage({ pokemonName: 'some-pokemon', shiny: true, happy: true })).toEqual(
      '/images/avatar/happy/some-pokemon_happy_shiny.png'
    )
  })
})
