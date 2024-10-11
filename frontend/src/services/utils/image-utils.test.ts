import { mainskillImage } from '@/services/utils/image-utils'
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
