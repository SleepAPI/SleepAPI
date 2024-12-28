<template>
  <v-container style="max-width: 600px">
    <v-row>
      <v-col cols="12">
        <v-card class="pb-4">
          <v-row class="pt-4">
            <v-col cols="12" class="flex-center text-h4"> User Settings </v-col>
          </v-row>
          <v-row>
            <v-divider />
          </v-row>
          <v-row>
            <v-col cols="12" class="flex-center">
              <span class="text-center"
                >Sleep API does not store personal information. We only store an identifier connected to your Google
                account so we may recognize you between sessions.</span
              >
            </v-col>
          </v-row>

          <v-row>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
            <v-col class="flex-center text-h6" style="text-wrap: nowrap"> Account settings </v-col>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" class="flex-center flex-column">
              <span class="text-center">E-mail: {{ userStore.email ?? 'missing, log out and back in' }}</span>
              <span class="text-center font-weight-thin font-italic text-body-2 text-grey"
                >This is only stored on your device, we do not store personal information</span
              >
            </v-col>
          </v-row>

          <v-row dense>
            <v-spacer />

            <v-col cols="5" class="flex-center">
              <v-btn color="secondary" class="w-100" @click="logout">Logout</v-btn>
            </v-col>

            <v-col cols="5" class="flex-center" stacked>
              <v-btn color="warning" class="w-100" @click="showDeleteConfirmationDialog">Delete account</v-btn>
            </v-col>

            <v-spacer />
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Account Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Confirm Account Deletion</v-card-title>
        <v-card-text>Are you sure you want to delete your account? This action cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeDialog">Cancel</v-btn>
          <v-btn color="warning" @click="confirmDeleteAccount">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { GoogleService } from '@/services/login/google-service'
import { useUserStore } from '@/stores/user-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UserSettingsPage',
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  data() {
    return {
      deleteDialog: false
    }
  },
  methods: {
    logout() {
      this.userStore.logout()
    },
    showDeleteConfirmationDialog() {
      this.deleteDialog = true
    },
    closeDialog() {
      this.deleteDialog = false
    },
    async confirmDeleteAccount() {
      this.closeDialog()
      await GoogleService.delete()
      this.userStore.logout()
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/main';
</style>
