import type { TeamProduction } from '@/types/member/instanced'
import { createMockMemberWithProduction } from '@/vitest/mocks/calculator/member-production'
import { mockCookingResult } from '@/vitest/mocks/calculator/mock-cooking-result'
import { berry, ingredient } from 'sleepapi-common'

export function createMockTeamProduction(attrs?: Partial<TeamProduction>): TeamProduction {
  return {
    team: {
      cooking: mockCookingResult(),
      berries: [{ amount: 10, berry: berry.BELUE, level: 60 }],
      ingredients: [{ amount: 10, ingredient: ingredient.FANCY_APPLE }]
    },
    members: [createMockMemberWithProduction().production],
    ...attrs
  }
}
