<template>
  <v-container class="team-container pt-2">
    <v-row v-if="!isMobile" id="desktop-layout" class="d-flex justify-left flex-nowrap">
      <v-col cols="auto">
        <v-card-actions class="px-0" :disabled="!userStore.loggedIn">
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

        <TeamSettings />

        <v-window v-model="teamStore.currentIndex" continuous class="mt-2">
          <v-window-item v-for="(team, index) in teamStore.teams" :key="index">
            <v-row class="flex-column" dense style="height: 75dvh">
              <v-col v-for="member in teamSlots" :key="member" :class="[teamSlots > 1 ? 'team-slot' : '']">
                <TeamSlot :member-index="member - 1" />
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-col>

      <v-col v-if="teamStore.getCurrentTeam.production" class="mt-3">
        <v-card :loading="teamStore.loadingTeams" class="fill-height frosted-glass">
          <template v-if="teamStore.getTeamSize > 1">
            <v-tabs v-model="teamStore.tab" class="d-flex justify-space-around">
              <v-tab
                v-for="(tabItem, index) in tabs"
                :key="tabItem.value"
                :value="tabItem.value"
                :data-index="index"
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
          </template>
          <template v-else>
            <MemberResults />
          </template>
        </v-card>
      </v-col>
      <v-col v-else-if="teamStore.getTeamSize > 0" class="mt-3">
        <v-card class="fill-height">
          <v-col cols="12">
            <v-skeleton-loader type="card"></v-skeleton-loader>
            <v-skeleton-loader type="subtitle"></v-skeleton-loader>
          </v-col>

          <v-row>
            <v-col cols="6">
              <v-skeleton-loader type="image"></v-skeleton-loader>
            </v-col>
            <v-col cols="6">
              <v-skeleton-loader type="paragraph"></v-skeleton-loader>
              <v-skeleton-loader type="paragraph"></v-skeleton-loader>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mobile Layout -->
    <div v-else id="mobile-layout">
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
            <v-col v-for="member in teamSlots" :key="member" class="team-slot" style="position: relative">
              <TeamSlot :member-index="member - 1" />
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>

      <TeamSettings class="pt-3 pb-2" />

      <v-row v-if="teamStore.getCurrentTeam.production" dense>
        <v-col cols="12">
          <v-card :loading="teamStore.loadingTeams" class="fill-height frosted-glass">
            <template v-if="teamStore.getTeamSize > 1">
              <v-tabs v-model="teamStore.tab" class="d-flex justify-space-around">
                <v-tab
                  v-for="(tabItem, index) in tabs"
                  :key="tabItem.value"
                  :value="tabItem.value"
                  :data-index="index"
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
            </template>
            <template v-else>
              <MemberResults />
            </template>
          </v-card>
        </v-col>
      </v-row>
      <v-col v-else-if="teamStore.getTeamSize > 0" class="mt-3">
        <v-card class="fill-height">
          <v-col cols="12">
            <v-skeleton-loader type="card"></v-skeleton-loader>
          </v-col>

          <v-col cols="12">
            <v-skeleton-loader max-height="50" type="image"></v-skeleton-loader>
          </v-col>
          <v-row>
            <v-col cols="6">
              <v-skeleton-loader type="paragraph"></v-skeleton-loader>
            </v-col>
            <v-col cols="6">
              <v-skeleton-loader type="paragraph"></v-skeleton-loader>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import CookingResults from '@/components/calculator/results/cooking-results.vue'
import MemberResults from '@/components/calculator/results/member-results/member-results.vue'
import TeamResults from '@/components/calculator/results/team-results.vue'
import TeamName from '@/components/calculator/team-name.vue'
import TeamSettings from '@/components/calculator/team-settings.vue'
import TeamSlot from '@/components/calculator/team-slot.vue'
import { useViewport } from '@/composables/viewport-composable'
import { useNotificationStore } from '@/stores/notification-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { MAX_TEAM_MEMBERS } from '@/types/member/instanced'

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

    const { isMobile } = useViewport()

    return { userStore, teamStore, pokemonStore, notificationStore, isMobile }
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
    },
    teamSlots() {
      return this.teamStore.getTeamSize === 0 ? 1 : MAX_TEAM_MEMBERS
    }
  },
  watch: {
    'teamStore.currentIndex': {
      async handler(newIndex) {
        if (!this.teamStore.teams[newIndex].production) {
          await this.teamStore.calculateProduction(newIndex)
        }
      },
      immediate: true
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
  background: rgba($surface, 0.2) !important;
  backdrop-filter: blur(10px);
}

.tab-item {
  flex: 1;
}

.team-slot {
  aspect-ratio: 6 / 10;
  max-height: 20dvh;
}

.team-container {
  max-width: 100%;
}

@media (min-width: $desktop) {
  .team-container {
    max-width: 90dvw;
  }

  .team-slot {
    aspect-ratio: 6 / 9;
    max-height: 15dvh;
  }
}
</style>
