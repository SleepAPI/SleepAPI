import type { MemberInstanceProductionExt } from '@/types/member/instanced'
import { createMockMemberProduction } from '@/vitest/mocks/calculator/member-production'
import { createMockPokemon } from '@/vitest/mocks/pokemon-instance'
import { ingredient } from 'sleepapi-common'

export function createMockMemberInstanceProduction(attrs?: Partial<MemberInstanceProductionExt>) {
  return {
    ...createMockMemberProduction({
      memberExternalId: 'mock-id'
    }),
    pokemonInstance: createMockPokemon(),
    ingredients: [
      { amount: 10, name: ingredient.HONEY.name },
      { amount: 5, name: ingredient.BEAN_SAUSAGE.name }
    ],
    ...attrs
  }
}
