import type {
  MemberProductionExt,
  PerformanceDetails,
  SingleMemberProduction
} from '@/types/member/instanced'
import { createMockPokemon } from '@/vitest/mocks/pokemon-instance'
import { berry, ingredient } from 'sleepapi-common'

export function createMockMemberProduction(
  attrs?: Partial<MemberProductionExt>
): MemberProductionExt {
  return {
    memberExternalId: createMockPokemon().externalId,
    produceTotal: {
      berries: [
        {
          amount: 10,
          berry: berry.BELUE,
          level: 60
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
          level: 60
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
    singleProduction: createMockMemberSingleProduction(),
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
      morningProcs: 0
    },
    ...attrs
  }
}

export function createMockMemberSingleProduction(
  attrs?: Partial<SingleMemberProduction>
): SingleMemberProduction {
  const performanceDetails: PerformanceDetails = {
    berry: 50,
    ingredient: 50,
    ingredientsOfTotal: [50],
    skill: 50
  }
  return {
    summary: {} as any,
    detailedProduce: {} as any,
    performanceAnalysis: {
      neutral: performanceDetails,
      optimal: performanceDetails,
      user: performanceDetails
    },
    ...attrs
  }
}
