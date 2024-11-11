import type { TeamInstance } from '@/types/member/instanced'
import { createMockTeamProduction } from '@/vitest/mocks/calculator/team-production'
import { createMockMemberIv } from '@/vitest/mocks/member-iv'
import { createMockPokemon } from '@/vitest/mocks/pokemon-instance'

export function createMockTeams(nrOfTeams = 1, attrs?: Partial<TeamInstance>) {
  const teams: TeamInstance[] = []
  const mockPokemonExternalId = createMockPokemon().externalId
  for (let i = 0; i < nrOfTeams; i++) {
    teams.push({
      index: i,
      memberIndex: 0,
      name: `Helper team ${i + 1}`,
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipeType: 'curry',
      favoredBerries: [],
      version: 0,
      members: [mockPokemonExternalId, ...new Array(4).fill(undefined)],
      production: createMockTeamProduction(),
      memberIvs: { [mockPokemonExternalId]: createMockMemberIv() },
      ...attrs
    })
  }
  return teams
}
