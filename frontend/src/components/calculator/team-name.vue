<template>
  <v-card id="teamNameCard" class="flex-grow-1 text-center" rounded="xl">
    <v-row>
      <v-col class="team-name">
        <v-skeleton-loader
          v-if="teamStore.loadingTeams"
          type="card"
          style="width: 100%"
        ></v-skeleton-loader>
        <template v-else>
          <v-text-field
            v-model="teamStore.getCurrentTeam.name"
            :rules="[
              (v) =>
                (v || '').length <= maxTeamNameLength ||
                `Description must be ${maxTeamNameLength} characters or less`
            ]"
            append-inner-icon="mdi-pencil"
            label="Team name"
            density="compact"
            variant="solo"
            hide-details
            single-line
            @input="filterInput"
            @update:focused="updateTeamName"
          ></v-text-field>
        </template>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { useNotificationStore } from '@/stores/notification-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamName',
  setup() {
    const userStore = useUserStore()
    const teamStore = useTeamStore()
    const notificationStore = useNotificationStore()
    return { userStore, teamStore, notificationStore }
  },
  data: () => ({
    isEditDialogOpen: false,
    maxTeamNameLength: 24
  }),
  computed: {
    remainingChars() {
      return this.maxTeamNameLength - (this.currentTeamName.length || 0)
    },
    currentTeamName() {
      return this.teamStore.getCurrentTeam.name
    }
  },
  methods: {
    updateTeamName() {
      if (this.remainingChars >= 0) {
        if (this.remainingChars === this.maxTeamNameLength) {
          this.currentTeamName = `Helper team ${this.teamStore.currentIndex + 1}`
        }
        this.teamStore.updateTeam()
        this.isEditDialogOpen = false
      }
    },
    filterInput(event: Event) {
      const input = event.target as HTMLInputElement
      const regex = /^[a-zA-Z0-9 ]*$/
      if (!regex.test(input.value)) {
        this.teamStore.getCurrentTeam.name = this.teamStore.getCurrentTeam.name.replace(
          /[^a-zA-Z0-9 ]/g,
          ''
        )
      }
      if (input.value.length > this.maxTeamNameLength) {
        this.teamStore.getCurrentTeam.name = this.teamStore.getCurrentTeam.name.slice(0, -1)
      }
    }
  }
})
</script>

<style lang="scss">
.team-name {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
}

.text-center input {
  text-align: center;
}
</style>
