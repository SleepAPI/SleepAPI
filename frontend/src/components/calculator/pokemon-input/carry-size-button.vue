<template>
  <v-menu v-model="menu" :close-on-content-click="false" offset-y>
    <template #activator="{ props }">
      <v-btn class="w-100" v-bind="props" :disabled="singleStageMon">
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
import type { InstancedPokemonExt } from '@/types/member/instanced'
import { pokemon } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'CarrySizeButton',
  props: {
    pokemonInstance: {
      type: Object as PropType<InstancedPokemonExt>,
      required: true
    }
  },
  emits: ['update-carry'],
  data: () => ({
    menu: false
  }),
  computed: {
    carrySizeOptions() {
      const { carrySize, maxCarrySize } = this.pokemonInstance.pokemon
      const values = [carrySize]

      if (maxCarrySize > carrySize) {
        values.push(carrySize + 5)
        if (maxCarrySize === carrySize + 10) {
          values.push(maxCarrySize)
        }
      }

      return values
    },
    singleStageMon() {
      return this.pokemonInstance.pokemon.carrySize === this.pokemonInstance.pokemon.maxCarrySize
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
          this.pokemonInstance.carrySize > 0 && oldPokemon.name === pokemon.MOCK_POKEMON.name

        const newCarrySize = loadFromExisting
          ? this.pokemonInstance.carrySize
          : newPokemon.maxCarrySize
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
