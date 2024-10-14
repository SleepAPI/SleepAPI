<template>
  <v-container class="team-container pt-2">
    <v-card-actions class="px-0 pt-0" :disabled="!userStore.loggedIn">
      <v-btn
        icon="mdi-chevron-left"
        size="36"
        class="px-0 mx-auto"
        variant="plain"
        aria-label="previous team"
        :disabled="!userStore.loggedIn"
        @click="teamStore.prev"
      ></v-btn>

      <TeamName />

      <v-btn
        icon="mdi-chevron-right"
        size="36"
        class="px-0 mx-auto"
        variant="plain"
        aria-label="next team"
        :disabled="!userStore.loggedIn"
        @click="teamStore.next"
      ></v-btn>
    </v-card-actions>

    <v-window v-model="teamStore.currentIndex" continuous style="margin-top: -5px">
      <v-window-item v-for="(team, index) in teamStore.teams" :key="index">
        <v-row class="flex-nowrap" dense>
          <v-col v-for="member in 5" :key="member" class="team-slot" style="position: relative">
            <TeamSlot :member-index="member - 1" />
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>

    <TeamSettings class="pt-3 pb-2" />

    <v-row v-if="teamStore.getCurrentTeam.production" dense>
      <v-col cols="12">
        <v-card :loading="teamStore.loadingTeams" color="transparent">
          <v-tabs v-model="teamStore.tab" class="d-flex justify-space-around">
            <v-tab
              v-for="tabItem in tabs"
              :key="tabItem.value"
              :value="tabItem.value"
              :class="[teamStore.tab === tabItem.value ? 'frosted-tab' : 'bg-surface', 'tab-item']"
            >
              {{ tabItem.label }}
            </v-tab>
          </v-tabs>

          <v-tabs-window v-model="teamStore.tab">
            <v-tabs-window-item value="overview">
              <TeamResults />
            </v-tabs-window-item>

            <v-tabs-window-item value="members">
              <MemberResults />
            </v-tabs-window-item>

            <v-tabs-window-item value="cooking">
              <CookingResults />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else-if="teamStore.getTeamSize > 0" class="justify-space-around">
      <v-col cols="12">
        <v-skeleton-loader type="card">
          <v-col v-for="(_, index) in tabs" :key="index" cols="4" class="flex-center">
            <v-skeleton-loader type="button" width="100%" height="36px" class="flex-center" />
          </v-col>

          <v-col cols="12" class="">
            <v-skeleton-loader type="heading"></v-skeleton-loader>
          </v-col>

          <v-col cols="12">
            <v-skeleton-loader type="divider"></v-skeleton-loader>
          </v-col>

          <div v-for="i in Math.max(teamStore.getTeamSize, 1)" :key="i" class="w-100">
            <v-skeleton-loader type="list-item-avatar"></v-skeleton-loader>
          </div>
        </v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import CookingResults from '@/components/calculator/results/cooking-results.vue'
import MemberResults from '@/components/calculator/results/member-results.vue'
import TeamResults from '@/components/calculator/results/team-results.vue'
import TeamName from '@/components/calculator/team-name.vue'
import TeamSettings from '@/components/calculator/team-settings.vue'
import TeamSlot from '@/components/calculator/team-slot.vue'
import { useNotificationStore } from '@/stores/notification-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'

export default defineComponent({
  components: {
    TeamSlot,
    TeamName,
    TeamSettings,
    TeamResults,
    MemberResults,
    CookingResults
  },
  setup() {
    const userStore = useUserStore()
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const notificationStore = useNotificationStore()
    return { userStore, teamStore, pokemonStore, notificationStore }
  },
  data: () => ({
    tabs: [
      { value: 'overview', label: 'Overview' },
      { value: 'members', label: 'Members' },
      { value: 'cooking', label: 'Cooking' }
    ],
    currentMemberIndex: 0
  }),
  computed: {
    teamProduction() {
      const production = this.teamStore.getCurrentTeam.production
      const berries = production?.team.berries
      const ingredients = production?.team.ingredients
      return berries && ingredients ? `${berries}\n${ingredients}` : 'No production'
    }
  },
  watch: {
    'teamStore.currentIndex': {
      async handler(newIndex) {
        if (!this.teamStore.teams[newIndex].production) {
          await this.teamStore.calculateProduction(newIndex)
        }
      }
    }
  },
  async mounted() {
    await this.teamStore.syncTeams()

    if (!this.teamStore.getCurrentTeam.production) {
      await this.teamStore.calculateProduction(this.teamStore.currentIndex)
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/main';

.frosted-tab {
  background: rgba($surface, 0.8) !important;
  backdrop-filter: blur(10px);
}
.frosted-glass {
  background: rgba($surface, 0.4) !important;
  backdrop-filter: blur(10px);
}

.tab-item {
  flex: 1;
}

.team-slot {
  aspect-ratio: 6 / 10;
  max-height: 20dvh;
}

.team-label-margin {
  margin-inline-start: 0 !important;
}

.team-container {
  max-width: 100%;
}

@media (min-width: 1000px) {
  .team-container {
    max-width: 60dvw;
  }
}
</style>
