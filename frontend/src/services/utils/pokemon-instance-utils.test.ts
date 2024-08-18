import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import {
  ingredient,
  nature,
  pokemon,
  subskill,
  type PokemonInstanceExt,
  type PokemonInstanceWithMeta
} from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

// Mock data for testing
const mockPokemonInstanceWithMeta: PokemonInstanceWithMeta = {
  version: 1,
  saved: true,
  shiny: false,
  externalId: 'external-id',
  pokemon: pokemon.PIKACHU.name,
  name: pokemon.PIKACHU.name,
  level: 10,
  ribbon: 0,
  carrySize: 1,
  skillLevel: 1,
  nature: 'Bashful',
  subskills: [
    { level: 10, subskill: 'Helping Bonus' },
    { level: 25, subskill: 'Berry Finding S' }
  ],
  ingredients: [
    { level: 0, ingredient: 'Sausage' },
    { level: 30, ingredient: 'Sausage' },
    { level: 60, ingredient: 'Sausage' }
  ]
}

const mockPokemonInstanceExt: PokemonInstanceExt = {
  version: 1,
  saved: true,
  shiny: false,
  externalId: 'external-id',
  pokemon: pokemon.PIKACHU,
  name: pokemon.PIKACHU.name,
  level: 10,
  ribbon: 0,
  carrySize: 1,
  skillLevel: 1,
  nature: nature.BASHFUL,
  subskills: [
    { level: 10, subskill: subskill.HELPING_BONUS },
    { level: 25, subskill: subskill.BERRY_FINDING_S }
  ],
  ingredients: [
    { level: 0, ingredient: ingredient.BEAN_SAUSAGE },
    { level: 30, ingredient: ingredient.BEAN_SAUSAGE },
    { level: 60, ingredient: ingredient.BEAN_SAUSAGE }
  ]
}

describe('toPokemonInstanceExt', () => {
  it('should convert a valid PokemonInstanceWithMeta to PokemonInstanceExt', () => {
    const result = PokemonInstanceUtils.toPokemonInstanceExt(mockPokemonInstanceWithMeta)
    expect(result).toEqual(mockPokemonInstanceExt)
  })

  it('should throw an error if ingredient data is corrupt (not exactly 3)', () => {
    const corruptInstance = {
      ...mockPokemonInstanceWithMeta,
      ingredients: [{ level: 0, ingredient: 'incorrect' }]
    }

    expect(() => PokemonInstanceUtils.toPokemonInstanceExt(corruptInstance)).toThrow(
      'Received corrupt ingredient data'
    )
  })

  it('should throw an error if subskill data is corrupt (more than 5)', () => {
    const corruptInstance = {
      ...mockPokemonInstanceWithMeta,
      subskills: [
        { level: 10, subskill: 'Helping Hand' },
        { level: 25, subskill: 'Berry Finder' },
        { level: 50, subskill: 'Speed Boost' },
        { level: 75, subskill: 'Item Finder' },
        { level: 100, subskill: 'Quick Attack' },
        { level: 100, subskill: 'Thunderbolt' } // Extra subskill
      ]
    }

    expect(() => PokemonInstanceUtils.toPokemonInstanceExt(corruptInstance)).toThrow(
      'Received corrupt subskill data'
    )
  })
})

describe('toUpsertTeamMemberRequest', () => {
  it('should convert a valid PokemonInstanceExt to PokemonInstanceWithMeta', () => {
    const result = PokemonInstanceUtils.toUpsertTeamMemberRequest(mockPokemonInstanceExt)
    expect(result).toEqual(mockPokemonInstanceWithMeta)
  })

  it('should throw an error if ingredient data is corrupt (not exactly 3)', () => {
    const corruptInstance = {
      ...mockPokemonInstanceExt,
      ingredients: [{ level: 0, ingredient: ingredient.BEAN_SAUSAGE }]
    }

    expect(() => PokemonInstanceUtils.toUpsertTeamMemberRequest(corruptInstance)).toThrow(
      'Received corrupt ingredient data'
    )
  })

  it('should throw an error if subskill data is corrupt (more than 5)', () => {
    const corruptInstance = {
      ...mockPokemonInstanceExt,
      subskills: [
        { level: 10, subskill: subskill.HELPING_BONUS },
        { level: 25, subskill: subskill.DREAM_SHARD_BONUS },
        { level: 50, subskill: subskill.ENERGY_RECOVERY_BONUS },
        { level: 75, subskill: subskill.BERRY_FINDING_S },
        { level: 100, subskill: subskill.HELPING_SPEED_M },
        { level: 100, subskill: subskill.INGREDIENT_FINDER_S } // Extra subskill
      ]
    }

    expect(() => PokemonInstanceUtils.toUpsertTeamMemberRequest(corruptInstance)).toThrow(
      'Received corrupt subskill data'
    )
  })
})
