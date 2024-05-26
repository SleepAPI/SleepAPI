<template>
  <v-container class="team-container">
    <v-card-actions class="px-0 pt-0" :disabled="!userStore.loggedIn">
      <v-btn
        icon="mdi-chevron-left"
        variant="plain"
        :disabled="!userStore.loggedIn"
        style="width: 36px; height: 36px"
        @click="prev"
      ></v-btn>

      <TeamName
        :loading-teams="loadingTeams"
        :team-index="teamIndex"
        :team-name="getCurrentTeamName"
        :team-camp="getCurrentTeamCamp"
        @update-team-name="updateTeamName"
      ></TeamName>

      <v-btn
        class="team-label-margin"
        icon="mdi-chevron-right"
        variant="plain"
        :disabled="!userStore.loggedIn"
        style="width: 36px; height: 36px"
        @click="next"
      ></v-btn>
    </v-card-actions>

    <v-window v-model="teamIndex">
      <v-window-item v-for="(team, index) in teams" :key="index">
        <v-row class="flex-nowrap" dense>
          <v-col v-for="member in 5" :key="member" class="team-slot">
            <TeamSlot />
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TeamName from '@/components/calculator/team-name.vue'
import TeamSlot from '@/components/calculator/team-slot.vue'
import { TeamService } from '@/services/team/team-service'
import { useNotificationStore } from '@/stores/notification-store'
import { useUserStore } from '@/stores/user-store'

export default defineComponent({
  components: {
    TeamSlot,
    TeamName
  },
  setup() {
    const userStore = useUserStore()
    const notificationStore = useNotificationStore()
    return { userStore, notificationStore }
  },
  data: () => ({
    teamIndex: 0,
    maxAvailableTeams: 5,
    teams: Array.from({ length: 1 }, (_, i) => ({
      index: i,
      name: '',
      camp: false
    })),
    loadingTeams: true
  }),
  computed: {
    getCurrentTeamName() {
      return this.teams[this.teamIndex].name
    },
    getCurrentTeamCamp() {
      return this.teams[this.teamIndex].camp
    }
  },
  async mounted() {
    if (this.userStore.loggedIn) {
      const teams = await TeamService.getTeams()

      this.teams = Array.from({ length: 5 }, (_, i) => {
        const teamFromResponse = teams.find((team) => team.index === i)
        return teamFromResponse
          ? teamFromResponse
          : { index: i, name: `Helper team ${i + 1}`, camp: false }
      })
    } else {
      this.teams = this.teams.map((team) => ({
        ...team,
        name: 'Log in to save your team'
      }))
    }
    this.loadingTeams = false
  },
  methods: {
    next() {
      this.teamIndex = (this.teamIndex + 1) % this.teams.length
    },
    prev() {
      this.teamIndex = (this.teamIndex - 1 + this.teams.length) % this.teams.length
    },
    updateTeamName(updatedName: string) {
      this.teams[this.teamIndex].name = updatedName
    }
  }
})
</script>

<style lang="scss">
.team-slot {
  aspect-ratio: 6 / 14;
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
