import type { Migration, StoreMap } from '@/stores/migration/migration-type'
import type { useTeamStore } from '@/stores/team/team-store'
import type { useUserStore } from '@/stores/user-store'
import { getIsland, type Area } from 'sleepapi-common'

export default {
  version: 6,
  description: 'Adds rank thresholds to stored team and user islands.',
  up: (stores: StoreMap) => {
    const teamStore = stores.team as ReturnType<typeof useTeamStore>
    const userStore = stores.user as ReturnType<typeof useUserStore>

    teamStore.$patch((state) => {
      for (const team of state.teams) {
        addRankThresholds(team.island)
      }
    })

    userStore.$patch((state) => {
      for (const island of Object.values(state.islands)) {
        addRankThresholds(island)
      }
    })
  }
} satisfies Migration

function addRankThresholds(island: Area) {
  island.rankThresholds ??= [...getIsland(island.shortName).rankThresholds]
  if (island.expert) {
    addRankThresholds(island.base)
  }
}
