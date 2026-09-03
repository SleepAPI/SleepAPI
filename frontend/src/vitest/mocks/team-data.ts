import type { TeamData } from '@/types/team/team-data'
import { createMockTeamProduction } from '@/vitest/mocks/calculator/team-production'
import { createMockMemberIv } from '@/vitest/mocks/member-iv'
import { createMockPokemon } from '@/vitest/mocks/pokemon-instance'
import { commonMocks, defaultMealPlan } from 'sleepapi-common'

export function createMockTeamData(attrs?: Partial<TeamData>): TeamData {
  const mockPokemon1 = createMockPokemon({ externalId: 'member1' })
  const mockPokemon2 = createMockPokemon({ externalId: 'member2' })

  return {
    index: 0,
    memberIndex: 0,
    name: 'Test Team',
    camp: false,
    bedtime: '21:30',
    wakeup: '06:00',
    recipeType: 'curry',
    mealPlan: defaultMealPlan(),
    island: commonMocks.islandInstance(),
    stockpiledBerries: [],
    stockpiledIngredients: [],
    version: 0,
    members: [mockPokemon1, mockPokemon2],
    production: createMockTeamProduction(),
    memberIvs: {
      [mockPokemon1.externalId]: createMockMemberIv(),
      [mockPokemon2.externalId]: createMockMemberIv()
    },
    ...attrs
  }
}

export function createMockTeamDataArray(count = 1, attrs?: Partial<TeamData>): TeamData[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTeamData({
      index: i,
      name: `Test Team ${i + 1}`,
      ...attrs
    })
  )
}
