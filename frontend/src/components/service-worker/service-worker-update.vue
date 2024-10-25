<template>
  <v-banner
    v-if="updateFound"
    bg-color="primary"
    position="fixed"
    location="bottom center"
    class="flex-center"
    style="z-index: 2000"
  >
    <span class="text-center text-body-1"
      >A new version of Sleep API is available. Please refresh the page.
    </span>
  </v-banner>
</template>

<script lang="ts">
import { useVersionStore } from '@/stores/version-store/version-store'
import { onMounted, ref } from 'vue'

export default {
  setup() {
    const showBanner = ref(false)
    const versionStore = useVersionStore()

    onMounted(() => {
      if ('serviceWorker' in navigator) {
        const swUrl = import.meta.env.DEV ? '/dev-dist/sw.js' : '/sw.js'
        navigator.serviceWorker
          .register(swUrl)
          .then((reg) => {
            if (versionStore.updateFound) {
              versionStore.updateVersion()
            } else {
              console.debug(`Client cache up to date with version ${versionStore.version}`)
            }

            reg.onupdatefound = () => {
              if (!versionStore.updateFound) {
                console.debug(
                  `Service worker found update, client was on ${versionStore.version}, prompting client to refresh`
                )
                showBanner.value = true
              }
            }
          })
          .catch(() => {
            console.error('Error during service worker registration, contact developer')
          })
      }
    })

    return {
      updateFound: showBanner
    }
  }
}
</script>
