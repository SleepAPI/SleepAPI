<template>
  <v-btn
    v-if="pokemonInstance.gender !== undefined"
    icon
    color="surface"
    elevation="0"
    class="gender-toggle"
    style="right: 4px; position: absolute; bottom: 0"
    size="40"
    :disabled="!genderToggleEnabled"
    @click="toggleGender"
  >
    <v-icon v-if="pokemonInstance.gender === 'male'" color="blue" size="24">mdi-gender-male</v-icon>
    <v-icon v-else color="primary" size="24">mdi-gender-female</v-icon>
  </v-btn>
</template>

<script lang="ts">
import { allowsGenderToggle, fixedGenderForSpecies, type PokemonInstance } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'GenderButton',
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstance>,
      required: true
    }
  },
  emits: ['update-gender'],
  computed: {
    pokemon() {
      return this.pokemonInstance.pokemon
    },
    genderToggleEnabled() {
      return allowsGenderToggle(this.pokemon)
    }
  },
  watch: {
    pokemon: {
      handler: 'syncGenderToSpecies',
      immediate: true
    }
  },
  methods: {
    syncGenderToSpecies() {
      const fixed = fixedGenderForSpecies(this.pokemon)
      if (fixed !== undefined && this.pokemonInstance.gender !== fixed) {
        this.$emit('update-gender', fixed)
      }
    },
    toggleGender() {
      if (!this.genderToggleEnabled) {
        return
      }
      const newGender = this.pokemonInstance.gender === 'male' ? 'female' : 'male'
      this.$emit('update-gender', newGender)
    }
  }
}
</script>

<style scoped lang="scss">
// override disabled styling so it appears as a flat indicator rather than a greyed-out button
.gender-toggle[disabled] :deep(.v-btn__overlay) {
  opacity: 0 !important;
}
</style>
