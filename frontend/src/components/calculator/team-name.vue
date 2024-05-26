<template>
  <v-badge
    :model-value="!loadingTeams && notificationStore.showTeamNameNotification"
    dot
    color="primary"
    class="flex-grow-1"
  >
    <v-card
      id="teamNameCard"
      class="flex-grow-1 text-center"
      rounded="xl"
      :disabled="!userStore.loggedIn"
      @click="openEditDialog"
    >
      <v-row>
        <v-col class="team-name">
          <v-skeleton-loader
            v-if="loadingTeams"
            type="card"
            style="width: 100%"
          ></v-skeleton-loader>
          <template v-else>
            <span style="width: 100%; font-size: 0.875rem; margin: 24px">{{ teamName }}</span>
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
import { TeamService } from '@/services/team/team-service'
import { useNotificationStore } from '@/stores/notification-store'
import { useUserStore } from '@/stores/user-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamName',
  props: {
    loadingTeams: {
      type: Boolean,
      default: false
    },
    teamIndex: {
      type: Number,
      default: 0
    },
    teamName: {
      type: String,
      default: ''
    },
    teamCamp: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update-team-name'],
  setup() {
    const userStore = useUserStore()
    const notificationStore = useNotificationStore()
    return { userStore, notificationStore }
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
      this.editedTeamName = this.teamName
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
        this.$emit('update-team-name', this.editedTeamName)

        await TeamService.createOrUpdateTeam(this.teamIndex, {
          name: this.editedTeamName,
          camp: this.teamCamp
        })
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
