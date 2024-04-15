<template>
  <v-app>
    <Navbar />

    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Navbar from '@/components/nav-bar/nav-bar.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    Navbar
  }
})
</script>

<style lang="scss">
@import '@/assets/main.scss';
</style>
