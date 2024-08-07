<template>
  <v-container class="team-container">
    <v-card-actions class="px-0 pt-0" :disabled="!userStore.loggedIn">
      <v-btn
        icon="mdi-chevron-left"
        variant="plain"
        :disabled="!userStore.loggedIn"
        style="width: 36px; height: 36px"
        @click="teamStore.prev"
      ></v-btn>

      <TeamName />

      <v-btn
        class="team-label-margin"
        icon="mdi-chevron-right"
        variant="plain"
        :disabled="!userStore.loggedIn"
        style="width: 36px; height: 36px"
        @click="teamStore.next"
      ></v-btn>
    </v-card-actions>

    <v-window v-model="teamStore.currentIndex" continuous style="overflow: visible">
      <v-window-item v-for="(team, index) in teamStore.teams" :key="index">
        <v-row class="flex-nowrap" dense>
          <v-col v-for="member in 5" :key="member" class="team-slot" style="position: relative">
            <TeamSlot :member-index="member - 1" />
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>

    <TeamSettings class="pt-4" />

    <v-row>
      <v-col cols="12">
        <v-card :loading="teamStore.loadingTeams" color="transparent">
          <v-tabs v-model="tab" class="d-flex justify-space-around">
            <v-tab
              v-for="tabItem in tabs"
              :key="tabItem.value"
              :value="tabItem.value"
              :class="[tab === tabItem.value ? 'frosted-tab' : 'bg-surface', 'tab-item']"
            >
              {{ tabItem.label }}
            </v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="team">
              <TeamResults />
            </v-tabs-window-item>

            <v-tabs-window-item value="members">
              <MemberResults />
            </v-tabs-window-item>

            <v-tabs-window-item value="todo">
              <TeamResults />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

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
    MemberResults
  },
  setup() {
    const userStore = useUserStore()
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const notificationStore = useNotificationStore()
    return { userStore, teamStore, pokemonStore, notificationStore }
  },
  data: () => ({
    tab: null,
    tabs: [
      { value: 'team', label: 'Team' },
      { value: 'members', label: 'Members' },
      { value: 'todo', label: 'TODO' }
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
  async mounted() {
    await this.teamStore.populateTeams()
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
  max-height: 25dvh;
}

.team-label-margin {
  margin-inline-start: 0 !important;
}

.team-container {
  max-width: 100%;
}

@media (min-width: 1000px) {
  .team-container {
    max-width: 50dvw;
  }
}
</style>
