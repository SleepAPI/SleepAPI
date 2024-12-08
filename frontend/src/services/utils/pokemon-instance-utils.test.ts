import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { createMockPokemon } from '@/vitest'
import { ingredient, subskill, type PokemonInstanceExt, type PokemonInstanceWithMeta } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

const mockPokemonInstanceExt: PokemonInstanceExt = createMockPokemon({
  subskills: [
    { level: 10, subskill: subskill.HELPING_BONUS },
    { level: 25, subskill: subskill.BERRY_FINDING_S }
  ]
})
const mockPokemonInstanceWithMeta: PokemonInstanceWithMeta = {
  version: mockPokemonInstanceExt.version,
  saved: mockPokemonInstanceExt.saved,
  shiny: mockPokemonInstanceExt.shiny,
  gender: mockPokemonInstanceExt.gender,
  externalId: mockPokemonInstanceExt.externalId,
  pokemon: mockPokemonInstanceExt.pokemon.name,
  name: mockPokemonInstanceExt.name,
  level: mockPokemonInstanceExt.level,
  ribbon: mockPokemonInstanceExt.ribbon,
  carrySize: mockPokemonInstanceExt.carrySize,
  skillLevel: mockPokemonInstanceExt.skillLevel,
  nature: mockPokemonInstanceExt.nature.name,
  subskills: [
    { level: 10, subskill: 'Helping Bonus' },
    { level: 25, subskill: 'Berry Finding S' }
  ],
  ingredients: [
    { level: 0, ingredient: 'Apple' },
    { level: 30, ingredient: 'Apple' },
    { level: 60, ingredient: 'Apple' }
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

    expect(() => PokemonInstanceUtils.toPokemonInstanceExt(corruptInstance)).toThrow('Received corrupt ingredient data')
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

    expect(() => PokemonInstanceUtils.toPokemonInstanceExt(corruptInstance)).toThrow('Received corrupt subskill data')
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

describe('toPokemonInstanceIdentity', () => {
  it('should convert a valid PokemonInstanceExt to PokemonInstanceIdentity', () => {
    const mockPokemonInstanceExt: PokemonInstanceExt = createMockPokemon()
    const result = PokemonInstanceUtils.toPokemonInstanceIdentity(mockPokemonInstanceExt)

    expect(result).toEqual({
      pokemon: mockPokemonInstanceExt.pokemon.name,
      nature: mockPokemonInstanceExt.nature.name,
      subskills: mockPokemonInstanceExt.subskills.map((subskill) => ({
        level: subskill.level,
        subskill: subskill.subskill.name
      })),
      ingredients: mockPokemonInstanceExt.ingredients.map((ingredient) => ({
        level: ingredient.level,
        ingredient: ingredient.ingredient.name
      })),
      carrySize: mockPokemonInstanceExt.carrySize,
      level: mockPokemonInstanceExt.level,
      ribbon: mockPokemonInstanceExt.ribbon,
      skillLevel: mockPokemonInstanceExt.skillLevel,
      externalId: mockPokemonInstanceExt.externalId
    })
  })
})
