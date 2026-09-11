import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import { createPinia, setActivePinia } from 'pinia'
import { EXPERT_ISLANDS, ISLANDS, type Area } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'
import migration from './006-add-rank-thresholds'

function removeRankThresholds(island: Area) {
  Reflect.deleteProperty(island, 'rankThresholds')
  if (island.expert) {
    removeRankThresholds(island.base)
  }
}

describe('006-add-rank-thresholds migration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it.each([...ISLANDS, ...EXPERT_ISLANDS])('should migrate stored $shortName islands and preserve settings', (area) => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()
    const settings = {
      areaBonus: 45,
      berries: [mocks.expertModeSettings().mainFavoriteBerry],
      ...(area.expert ? { expertMode: mocks.expertModeSettings() } : {})
    }
    const expectedIsland = JSON.parse(JSON.stringify({ ...area, ...settings }))
    const legacyIsland = JSON.parse(JSON.stringify(expectedIsland))
    removeRankThresholds(legacyIsland)
    teamStore.teams = createMockTeams(2, { island: legacyIsland })
    userStore.islands[area.shortName] = JSON.parse(JSON.stringify(legacyIsland))

    migration.up({ team: teamStore, user: userStore })

    for (const team of teamStore.teams) {
      expect(team.island).toEqual(expectedIsland)
    }
    expect(userStore.islands[area.shortName]).toEqual(expectedIsland)

    migration.up({ team: teamStore, user: userStore })

    expect(teamStore.teams[0].island).toEqual(expectedIsland)
    expect(userStore.islands[area.shortName]).toEqual(expectedIsland)
  })

  it('should leave current stores unchanged', () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()
    const teamState = JSON.parse(JSON.stringify(teamStore.$state))
    const userState = JSON.parse(JSON.stringify(userStore.$state))

    migration.up({ team: teamStore, user: userStore })

    expect(JSON.parse(JSON.stringify(teamStore.$state))).toEqual(teamState)
    expect(JSON.parse(JSON.stringify(userStore.$state))).toEqual(userState)
  })
})
