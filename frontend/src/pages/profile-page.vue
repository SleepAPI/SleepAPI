<template>
  <v-container style="max-width: 600px">
    <v-row>
      <v-col cols="12">
        <v-card class="pb-4">
          <v-row class="pt-4">
            <v-col cols="12" class="flex-center text-h4"> Profile </v-col>
          </v-row>
          <v-row>
            <v-divider />
          </v-row>
          <v-row>
            <v-col cols="12" class="flex-center">
              <span class="text-center">Bla bla.</span>
            </v-col>
          </v-row>

          <v-row>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
            <v-col class="flex-center text-h6" style="text-wrap: nowrap"> Avatar </v-col>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
          </v-row>

          <v-row>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
            <v-col class="flex-center text-h6" style="text-wrap: nowrap"> Name </v-col>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
          </v-row>

          <v-row>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
            <v-col class="flex-center text-h6" style="text-wrap: nowrap"> User ID </v-col>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" class="flex-center">
              <span class="text-center">{{ userStore.externalId }}</span>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { useUserStore } from '@/stores/user-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ProfilePage',
  setup() {
    const userStore = useUserStore()
    return { userStore }
  }
})
</script>
