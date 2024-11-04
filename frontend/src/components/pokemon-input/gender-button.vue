<template>
  <v-btn
    v-if="pokemonInstance.gender !== undefined"
    icon
    color="surface"
    elevation="0"
    style="right: 4px; position: absolute; bottom: 0"
    size="40"
    @click="toggleGender"
  >
    <v-icon v-if="pokemonInstance.gender === 'male'" color="blue" size="24">mdi-gender-male</v-icon>
    <v-icon v-else color="primary" size="24">mdi-gender-female</v-icon>
  </v-btn>
</template>

<script lang="ts">
import { RandomUtils, pokemon, type PokemonInstanceExt } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'GenderButton',
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstanceExt>,
      required: true
    }
  },
  emits: ['update-gender'],
  computed: {
    pokemon() {
      return this.pokemonInstance.pokemon
    }
  },
  watch: {
    pokemon: {
      deep: false,
      handler(newPokemon: pokemon.Pokemon, oldPokemon: pokemon.Pokemon) {
        // new mon is from search or new mon is actually new and not just mocked mon changing
        const loadFromExisting =
          oldPokemon.name === pokemon.MOCK_POKEMON.name && this.pokemonInstance.gender !== undefined

        if (loadFromExisting) {
          this.$emit('update-gender', this.pokemonInstance.gender)
          return
        } else {
          const unknownGender = newPokemon.genders.female + newPokemon.genders.male === 0
          const newGender = unknownGender
            ? undefined
            : RandomUtils.roll(newPokemon.genders.male)
              ? 'male'
              : 'female'

          this.$emit('update-gender', newGender)
        }
      }
    }
  },
  methods: {
    toggleGender() {
      const newGender = this.pokemonInstance.gender === 'male' ? 'female' : 'male'
      this.$emit('update-gender', newGender)
    }
  }
}
</script>
