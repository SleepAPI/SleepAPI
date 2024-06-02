<template>
  <TeamSection />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import TeamSection from '@/components/calculator/team-section.vue'
import { usePokedexStore } from '@/stores/pokedex-store/pokedex-store'

export default defineComponent({
  components: {
    TeamSection
  },
  setup() {
    const pokedexStore = usePokedexStore()
    return { pokedexStore }
  }
})
</script>

<style lang="scss"></style>
