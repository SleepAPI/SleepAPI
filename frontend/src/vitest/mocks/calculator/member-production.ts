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
    member: createMockPokemon(),

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
