<template>
  <TheBackground />

  <v-app>
    <v-main>
      <TheNavbar />
      <RouterView />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import TheBackground from '@/components/background/background.vue'
import TheNavbar from '@/components/nav-bar/nav-bar.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    TheNavbar,
    TheBackground
  }
})
</script>

<style lang="scss">
@import '@/assets/main.scss';
</style>
