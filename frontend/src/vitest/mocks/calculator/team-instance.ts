import type { TeamInstance } from '@/types/member/instanced'

export function createMockTeams(nrOfTeams = 1, attrs?: Partial<TeamInstance>) {
  const teams: TeamInstance[] = []
  for (let i = 0; i < nrOfTeams; i++) {
    teams.push({
      index: i,
      name: `Helper team ${i + 1}`,
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipeType: 'curry',
      favoredBerries: [],
      version: 0,
      members: new Array(5).fill(undefined),
      production: undefined,
      ...attrs
    })
  }
  return teams
}
