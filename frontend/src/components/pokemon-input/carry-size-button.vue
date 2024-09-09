<template>
  <v-menu v-model="menu" :close-on-content-click="false" offset-y>
    <template #activator="{ props }">
      <v-btn class="w-100" v-bind="props" :disabled="singleStageMon" append-icon="mdi-menu-down">
        <span class="text-body-1"> Carry size {{ pokemonInstance.carrySize }} </span>
      </v-btn>
    </template>

    <v-card>
      <v-list density="compact">
        <v-list-item v-for="value in carrySizeOptions" :key="value" @click="updateCarrySize(value)">
          <v-list-item-title>{{ value }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { maxCarrySize, mocks, pokemon, type PokemonInstanceExt } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'CarrySizeButton',
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstanceExt>,
      required: true
    }
  },
  emits: ['update-carry'],
  data: () => ({
    menu: false
  }),
  computed: {
    carrySizeOptions() {
      const { carrySize, previousEvolutions } = this.pokemonInstance.pokemon
      const values = [carrySize]

      for (let i = 1; i <= previousEvolutions; ++i) {
        values.push(carrySize + i * 5)
      }

      return values
    },
    singleStageMon() {
      return this.pokemonInstance.pokemon.previousEvolutions === 0
    },
    pokemon() {
      return this.pokemonInstance.pokemon
    }
  },
  watch: {
    pokemon: {
      handler(newPokemon: pokemon.Pokemon, oldPokemon: pokemon.Pokemon) {
        // new mon is from search or new mon is actually new and not just mocked mon changing
        const loadFromExisting =
          this.pokemonInstance.carrySize > 0 && oldPokemon.name === mocks.MOCK_POKEMON.name

        const newCarrySize = loadFromExisting
          ? this.pokemonInstance.carrySize
          : maxCarrySize(newPokemon)
        this.$emit('update-carry', newCarrySize)
      }
    }
  },
  methods: {
    updateCarrySize(newSize: number) {
      this.menu = false
      this.$emit('update-carry', newSize)
    }
  }
}
</script>
