<template>
  <v-menu v-model="menu" :close-on-content-click="true" offset-y>
    <template #activator="{ props }">
      <v-card v-bind="props">
        <v-row no-gutters>
          <v-col cols="3">
            <v-card class="flex-center rounded-te-0 rounded-be-0 fill-height" color="secondary">
              <v-img class="ma-2" :src="mainskillImage(pokemonInstance.pokemon)" max-height="50px"></v-img>
            </v-card>
          </v-col>
          <v-col cols="9">
            <v-card class="fill-height rounded-ts-0 rounded-bs-0 flex-column px-2" style="align-content: center">
              <div class="nowrap text-x-small">
                <span class="my-1">{{ skillName }}</span>
                <v-spacer></v-spacer>
                <span class="my-1">Lv.{{ mainskillLevel }}</span>
              </div>
              <v-divider />
              <div class="nowrap text-x-small">
                <span class="my-1"> {{ description }} </span>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </template>

    <v-card>
      <!-- hide overflow since selecting max value appears to give slight scrollbar -->
      <v-col cols="12" class="flex-center" style="overflow: hidden">
        <v-slider
          v-model="mainskillLevel"
          min="1"
          :max="pokemonInstance.pokemon.skill.maxLevel"
          :ticks="defaultValues"
          show-ticks="always"
          step="1"
          color="primary"
        ></v-slider>
      </v-col>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { mainskillImage } from '@/services/utils/image-utils'
import { type PokemonInstance } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'MainskillButton',
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstance>,
      required: true
    }
  },
  emits: ['update-skill-level'],
  setup() {
    return { mainskillImage }
  },
  data(this: { pokemonInstance: PokemonInstance }) {
    return {
      mainskillLevel: this.pokemonInstance.skillLevel,
      menu: false
    }
  },
  computed: {
    skillName() {
      return this.pokemonInstance.pokemon.skill.name
    },
    description() {
      return this.pokemonInstance.pokemon.skill.description({
        skillLevel: this.mainskillLevel,
        ingredient: this.pokemonInstance.pokemon.ingredient0.at(0)?.ingredient
      })
    },
    pokemon() {
      return this.pokemonInstance.pokemon
    },
    defaultValues() {
      return Array.from({ length: this.pokemon.skill.maxLevel }, (_, i) => i + 1).reduce(
        (acc, val) => {
          acc[val] = val.toString()
          return acc
        },
        {} as Record<number, string>
      )
    }
  },
  watch: {
    pokemon: {
      handler() {
        this.mainskillLevel = this.pokemonInstance.skillLevel
      }
    },
    mainskillLevel(newLevel: number) {
      this.$emit('update-skill-level', newLevel)
    }
  }
}
</script>
