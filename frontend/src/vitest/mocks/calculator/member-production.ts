import type { MemberProductionExt } from '@/types/member/instanced'
import { createMockPokemon } from '@/vitest/mocks/pokemon-instance'
import { berry, ingredient } from 'sleepapi-common'

export function createMockMemberProduction(attrs?: Partial<MemberProductionExt>) {
  return {
    member: createMockPokemon(),
    ingredients: [
      {
        amount: 10,
        ingredient: ingredient.FANCY_APPLE
      },
      {
        amount: 20,
        ingredient: ingredient.HONEY
      }
    ],
    skillProcs: 5,
    berries: {
      amount: 10,
      berry: berry.BELUE
    },
    ...attrs
  }
}
