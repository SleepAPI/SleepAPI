import { avatarImage, berryImage, islandImage, mainskillImage, pokemonImage } from '@/services/utils/image-utils'
import { berry, island, mainskill, mockPokemon, type Pokemon } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

const MOCK_POKEMON = mockPokemon()
describe('mainskillImage', () => {
  it('returns correct image path for HELPER_BOOST skill', () => {
    const mockPokemon: Pokemon = {
      ...MOCK_POKEMON,
      berry: berry.LEPPA,
      skill: mainskill.HELPER_BOOST
    }

    const result = mainskillImage(mockPokemon)
    expect(result).toBe('/images/type/fire.png')
  })

  it('returns correct image path for stockpile skill', () => {
    const mockPokemon: Pokemon = {
      ...MOCK_POKEMON,
      skill: mainskill.STOCKPILE_CHARGE_STRENGTH_S
    }

    const result = mainskillImage(mockPokemon)
    expect(result).toBe('/images/mainskill/stockpile_strength.png')
  })

  it('returns correct image path for other skills', () => {
    const mockPokemon: Pokemon = {
      ...MOCK_POKEMON,
      skill: mainskill.CHARGE_ENERGY_S
    }

    const result = mainskillImage(mockPokemon)
    expect(result).toBe('/images/mainskill/energy.png')
  })
})

describe('pokemonImage', () => {
  it('shall return correct pokemon image', () => {
    expect(pokemonImage({ pokemonName: 'some-pokemon', shiny: false })).toEqual('/images/pokemon/some-pokemon.png')
    expect(pokemonImage({ pokemonName: 'some-pokemon', shiny: false })).toEqual('/images/pokemon/some-pokemon.png')
  })

  it('shall return correct shiny pokemon image', () => {
    expect(pokemonImage({ pokemonName: 'some-pokemon', shiny: true })).toEqual('/images/pokemon/some-pokemon_shiny.png')
    expect(pokemonImage({ pokemonName: 'some-pokemon', shiny: true })).toEqual('/images/pokemon/some-pokemon_shiny.png')
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

describe('islandImage', () => {
  island.ISLANDS.forEach((island) => {
    it(`returns the correct image path for ${island.name} island`, () => {
      const imagePath = islandImage({ favoredBerries: island.berries, background: true })
      expect(imagePath).toBe(`/images/island/background-${island.shortName.toLowerCase()}.png`)
    })
  })

  it('returns greengrass image path if no match is found', () => {
    const imagePath = islandImage({ favoredBerries: [], background: false })
    expect(imagePath).toBe('/images/island/greengrass.png')
  })
})

describe('berryImage', () => {
  it('return the correct image path', () => {
    expect(berryImage(berry.BELUE)).toEqual('/images/berries/belue.png')
  })
})
