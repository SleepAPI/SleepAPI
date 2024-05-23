<template>
  <v-container class="team-container">
    <!-- TODO: should be wider, currently doesn't look great with max team name (caps at 24 chars) -->
    <v-card-actions class="px-0 pt-0" :disabled="!userStore.loggedIn">
      <v-btn
        icon="mdi-chevron-left"
        variant="plain"
        :disabled="!userStore.loggedIn"
        @click="prev"
      ></v-btn>

      <v-card
        class="flex-grow-1 text-center"
        rounded="xl"
        :disabled="!userStore.loggedIn"
        @click="openEditDialog"
      >
        <v-row>
          <v-col style="flex: 1">
            {{ getCurrentTeamName }}
          </v-col>
          <v-col style="position: absolute; right: 0px">
            <v-icon style="position: absolute; right: 0px">mdi-pencil-circle</v-icon>
          </v-col>
        </v-row>
      </v-card>
      <v-btn
        class="team-label-margin"
        icon="mdi-chevron-right"
        variant="plain"
        :disabled="!userStore.loggedIn"
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

    <!-- TODO: this width makes sense, but is random -->
    <v-dialog v-model="isEditDialogOpen" max-width="600px">
      <v-card title="Change Team Name">
        <v-card-text class="pt-4 pb-0">
          <v-textarea
            v-model="editedTeamName"
            :rules="[
              (v) =>
                (v || '').length <= maxTeamNameLength ||
                `Description must be ${maxTeamNameLength} characters or less`
            ]"
            :counter="maxTeamNameLength"
            clearable
            rows="2"
            no-resize
            label="Team Name"
            class="compact-control"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-spacer />
          <v-btn @click="closeEditDialog">Cancel</v-btn>
          <v-btn :disabled="remainingChars < 0" rounded="lg" color="primary" @click="saveEditDialog"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TeamSlot from '@/components/calculator/team-slot.vue'
import { TeamService } from '@/services/team/team-service'
import { useUserStore } from '@/stores/user-store'

export default defineComponent({
  components: {
    TeamSlot
  },
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  data: () => ({
    teamIndex: 0,
    maxAvailableTeams: 5,
    isEditDialogOpen: false,
    maxTeamNameLength: 24,
    editedTeamName: '',
    teams: Array.from({ length: 1 }, (_, i) => ({
      index: i,
      name: 'Log in to save teams',
      camp: false
    }))
  }),
  computed: {
    getCurrentTeamName() {
      return this.teams[this.teamIndex].name
    },
    remainingChars() {
      return this.maxTeamNameLength - (this.editedTeamName?.length || 0)
    }
  },
  async mounted() {
    if (this.userStore.loggedIn) {
      const teams = await TeamService.getTeams()

      this.teams = Array.from({ length: 5 }, (_, i) => {
        const teamFromResponse = teams.find((team) => team.index === i)
        return teamFromResponse
          ? teamFromResponse
          : { index: i, name: `Helper team #${i + 1}`, camp: false }
      })
    }
  },
  methods: {
    next() {
      this.teamIndex = (this.teamIndex + 1) % this.teams.length
    },
    prev() {
      this.teamIndex = (this.teamIndex - 1 + this.teams.length) % this.teams.length
    },
    openEditDialog() {
      this.editedTeamName = this.getCurrentTeamName
      this.isEditDialogOpen = true
    },
    closeEditDialog() {
      this.isEditDialogOpen = false
    },
    saveEditDialog() {
      if (this.remainingChars >= 0) {
        this.teams[this.teamIndex].name = this.editedTeamName

        TeamService.upsert(this.teamIndex, {
          name: this.teams[this.teamIndex].name,
          camp: this.teams[this.teamIndex].camp
        })
        this.isEditDialogOpen = false
      }
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
