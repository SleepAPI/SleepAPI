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
import { onMounted, ref } from 'vue'

export default {
  setup() {
    const showBanner = ref(false)

    onMounted(() => {
      if ('serviceWorker' in navigator) {
        const swUrl = import.meta.env.DEV ? '/dev-dist/sw.js' : '/sw.js'
        navigator.serviceWorker
          .register(swUrl)
          .then((reg) => {
            // TODO: here we probably could clean up cached stuff before checking update

            reg.onupdatefound = () => {
              showBanner.value = true
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
