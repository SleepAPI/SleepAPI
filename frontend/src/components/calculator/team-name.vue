<template>
  <v-badge
    :model-value="!teamStore.loadingTeams && notificationStore.showTeamNameNotification"
    dot
    color="primary"
    class="flex-grow-1"
  >
    <v-card id="teamNameCard" class="flex-grow-1 text-center" rounded="xl" @click="openEditDialog">
      <v-row>
        <v-col class="team-name">
          <v-skeleton-loader
            v-if="teamStore.loadingTeams"
            type="card"
            style="width: 100%"
          ></v-skeleton-loader>
          <template v-else>
            <span id="teamNameText" style="width: 100%; font-size: 0.875rem; margin: 24px">{{
              teamStore.getCurrentTeam.name
            }}</span>
          </template>
        </v-col>
      </v-row>
    </v-card>
  </v-badge>

  <v-dialog id="editTeamNameDialog" v-model="isEditDialogOpen" max-width="600px">
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
          @input="filterInput"
          @keydown.enter="saveEditDialog"
        ></v-textarea>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn id="cancelButton" @click="closeEditDialog">Cancel</v-btn>
        <v-btn
          id="saveButton"
          :disabled="remainingChars < 0"
          rounded="lg"
          color="primary"
          @click="saveEditDialog"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
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
    maxTeamNameLength: 24,
    editedTeamName: ''
  }),
  computed: {
    remainingChars() {
      return this.maxTeamNameLength - (this.editedTeamName?.length || 0)
    }
  },
  methods: {
    openEditDialog() {
      this.editedTeamName = this.teamStore.getCurrentTeam.name
      this.isEditDialogOpen = true

      if (this.notificationStore.showTeamNameNotification) {
        this.notificationStore.hideTeamNameNotification()
      }
    },
    closeEditDialog() {
      this.isEditDialogOpen = false
    },
    async saveEditDialog() {
      if (this.remainingChars >= 0) {
        this.teamStore.updateTeamName(this.editedTeamName)
        this.isEditDialogOpen = false
      }
    },
    filterInput(event: Event) {
      const input = event.target as HTMLInputElement
      const regex = /^[a-zA-Z0-9 ]*$/
      if (!regex.test(input.value)) {
        this.editedTeamName = this.editedTeamName.replace(/[^a-zA-Z0-9 ]/g, '')
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
</style>
