import type { MemberWithProduction } from '@/types/member/instanced'
import { createMockMemberIv } from '@/vitest/mocks/member-iv'
import { createMockPokemon } from '@/vitest/mocks/pokemon-instance'
import {
  berry,
  commonMocks,
  ingredient,
  ingredientSetToIntFlat,
  mainskillUnits,
  type MemberProduction,
  type MemberSkillValue
} from 'sleepapi-common'

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
    skillValue: Object.fromEntries(
      mainskillUnits.map((key) => [key, { amountToSelf: 0, amountToTeam: 0 }])
    ) as MemberSkillValue,
    skillLevel: mockPokemon.skillLevel,
    skillProcs: 5,
    advanced: {
      averageHelps: 0,
      skillCrits: 0,
      maxFrequency: 0,
      skillRegularValue: 0,
      totalHelps: 0,
      dayPeriod: {
        averageEnergy: 0,
        averageFrequency: 0,
        spilledIngredients: []
      },
      nightPeriod: {
        averageEnergy: 0,
        averageFrequency: 0,
        spilledIngredients: []
      },
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
      totalRecovery: 0,
      frequencySplit: {
        eighty: 0,
        sixty: 0,
        forty: 0,
        one: 0,
        zero: 0
      },
      skillProcDistribution: {},
      berryProductionDistribution: {},
      ingredientDistributions: {},
      teamSupport: {
        energy: 0,
        helps: 0
      }
    },
    strength: commonMocks.memberStrength(),
    ...attrs
  }
}

export function createMockMemberWithProduction(attrs?: Partial<MemberWithProduction>): MemberWithProduction {
  const mockPokemon = createMockPokemon()
  const member = attrs?.member ?? mockPokemon

  return {
    member,
    production: createMockMemberProduction({ skillLevel: member.skillLevel }),
    iv: createMockMemberIv(),
    ...attrs
  }
}
