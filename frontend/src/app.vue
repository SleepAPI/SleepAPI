<template>
  <v-app>
    <TheBackground />
    <TheNavbar />

    <v-main>
      <ServiceWorkerUpdate />
      <RouterView />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import TheBackground from '@/components/background/background.vue'
import TheNavbar from '@/components/nav-bar/nav-bar.vue'
import ServiceWorkerUpdate from '@/components/service-worker/service-worker-update.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    TheNavbar,
    TheBackground,
    ServiceWorkerUpdate
  }
})
</script>

<style lang="scss">
@import '@/assets/main.scss';
</style>
