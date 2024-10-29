<template>
  <v-container style="max-width: 600px">
    <v-row>
      <v-col cols="12">
        <v-card class="pb-4">
          <v-row class="pt-4">
            <v-col cols="12" class="flex-center text-h4"> Settings </v-col>
          </v-row>
          <v-row>
            <v-divider />
          </v-row>
          <v-row>
            <v-col cols="12" class="flex-center">
              <span class="text-center"
                >In case of issues please try clearing the cache. If that doesn't work, contact the
                developers and attach the site version found below.</span
              >
            </v-col>
          </v-row>

          <v-row>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
            <v-col class="flex-center text-h6" style="text-wrap: nowrap"> Cache settings </v-col>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="flex-center">
              <v-btn color="secondary" @click="clear">Clear cache</v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
            <v-col class="flex-center text-h6" style="text-wrap: nowrap"> Version </v-col>
            <v-col class="flex-center">
              <v-divider />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" class="flex-center flex-column">
              <span class="text-center"
                >Site version: {{ versionStore.version ?? 'missing, log out and back in' }}</span
              >
              <span class="text-center font-weight-thin font-italic text-body-2 text-grey"
                >Please provide this when you bug report</span
              >
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { clearCacheKeepLogin } from '@/stores/store-service'
import { useUserStore } from '@/stores/user-store'
import { useVersionStore } from '@/stores/version-store/version-store'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UserSettingsPage',
  setup() {
    const userStore = useUserStore()
    const versionStore = useVersionStore()
    return { userStore, versionStore }
  },
  methods: {
    clear() {
      // TODO: this should show a popup that it has been cleared, currently it looks like nothing is done
      clearCacheKeepLogin()
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/main';
</style>
