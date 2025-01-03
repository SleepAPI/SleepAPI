import type { MemberProductionExt } from '@/types/member/instanced'
import { createMockMemberIv } from '@/vitest/mocks/member-iv'
import { createMockPokemon } from '@/vitest/mocks/pokemon-instance'
import { berry, ingredient, ingredientSetToIntFlat, type MemberProduction } from 'sleepapi-common'

export function createMockMemberProduction(attrs?: Partial<MemberProduction>): MemberProduction {
  const mockPokemon = createMockPokemon()

  return {
    externalId: mockPokemon.externalId,
    pokemonWithIngredients: {
      pokemon: mockPokemon.name,
      ingredients: ingredientSetToIntFlat(mockPokemon.ingredients.map(({ ingredient }) => ({ ingredient, amount: 0 })))
    },
    produceTotal: {
      berries: [
        {
          amount: 10,
          berry: berry.BELUE,
          level: mockPokemon.level
        }
      ],
      ingredients: [
        {
          amount: 10,
          ingredient: ingredient.FANCY_APPLE
        },
        {
          amount: 20,
          ingredient: ingredient.HONEY
        }
      ]
    },
    produceFromSkill: {
      berries: [],
      ingredients: []
    },
    produceWithoutSkill: {
      berries: [
        {
          amount: 10,
          berry: berry.BELUE,
          level: mockPokemon.level
        }
      ],
      ingredients: [
        {
          amount: 10,
          ingredient: ingredient.FANCY_APPLE
        },
        {
          amount: 20,
          ingredient: ingredient.HONEY
        }
      ]
    },
    skillAmount: 100,
    skillProcs: 5,
    advanced: {
      skillCrits: 0,
      spilledIngredients: [],
      totalHelps: 0,
      dayHelps: 0,
      nightHelps: 0,
      nightHelpsBeforeSS: 0,
      nightHelpsAfterSS: 0,
      skillCritValue: 0,
      wastedEnergy: 0,
      morningProcs: 0,
      carrySize: 0,
      ingredientPercentage: 0,
      skillPercentage: 0,
      sneakySnack: { amount: 0, berry: mockPokemon.pokemon.berry, level: mockPokemon.level },
      totalRecovery: 0
    },
    ...attrs
  }
}

export function createMockMemberProductionExt(attrs?: Partial<MemberProductionExt>): MemberProductionExt {
  const mockPokemon = createMockPokemon()

  return {
    member: mockPokemon,
    production: createMockMemberProduction(),
    iv: createMockMemberIv(),
    ...attrs
  }
}
