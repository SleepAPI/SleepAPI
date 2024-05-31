<template>
  <v-menu v-model="menu" :close-on-content-click="false" offset-y>
    <template #activator="{ props }">
      <v-btn class="w-100" v-bind="props" :disabled="disabled">
        <span class="text-body-1"> Carry limit {{ carryLimit }} </span>
      </v-btn>
    </template>

    <v-card>
      <v-list density="compact">
        <v-list-item v-for="value in defaultValues" :key="value" @click="selectValue(value)">
          <v-list-item-title>{{ value }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { pokemon } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'CarryLimitButton',
  props: {
    pokemon: {
      type: Object as PropType<pokemon.Pokemon | undefined>,
      required: false,
      default: undefined
    }
  },
  emits: ['update-limit'],
  data: () => ({
    carryLimit: 0,
    menu: false
  }),
  computed: {
    defaultValues() {
      if (!this.pokemon) {
        return []
      }
      const { carrySize, maxCarrySize } = this.pokemon
      const values = [carrySize]

      if (maxCarrySize > carrySize) {
        values.push(carrySize + 5)
        if (maxCarrySize === carrySize + 10) {
          values.push(maxCarrySize)
        }
      }

      return values
    },
    disabled() {
      return !this.pokemon || this.pokemon.carrySize === this.pokemon.maxCarrySize
    }
  },
  watch: {
    pokemon: {
      immediate: true,
      handler(newPokemon) {
        if (newPokemon) {
          this.carryLimit = newPokemon.maxCarrySize
        }
      }
    }
  },
  methods: {
    selectValue(value: number) {
      this.updateCarryLimit(value)
      this.menu = false
    },
    updateCarryLimit(newLimit: number) {
      this.carryLimit = newLimit
      this.$emit('update-limit', newLimit)
    }
  }
}
</script>
