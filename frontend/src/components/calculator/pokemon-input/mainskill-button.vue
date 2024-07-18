<template>
  <v-menu v-model="menu" :close-on-content-click="false" offset-y>
    <template #activator="{ props }">
      <v-card v-bind="props">
        <v-row no-gutters>
          <v-col cols="3">
            <v-card class="flex-center rounded-te-0 rounded-be-0 fill-height" color="secondary">
              <v-img class="ma-2" :src="mainskillImage" max-height="50px"></v-img>
            </v-card>
          </v-col>
          <v-col cols="9">
            <v-card
              class="fill-height rounded-ts-0 rounded-bs-0 flex-column px-2"
              style="align-content: center"
            >
              <div class="nowrap responsive-text">
                <span class="my-1">{{ skillName }}</span>
                <v-spacer></v-spacer>
                <span class="my-1">Lv.{{ mainskillLevel }}</span>
              </div>
              <v-divider />
              <div class="nowrap responsive-text-small">
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
import { mainskill, pokemon, type PokemonInstanceExt } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'MainskillButton',
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstanceExt>,
      required: true
    }
  },
  emits: ['update-skill-level'],
  data: () => ({
    mainskillLevel: 1,
    menu: false,
    defaultValues: {} as Record<number, string>
  }),
  computed: {
    skillName() {
      return this.pokemonInstance.pokemon.skill.name
    },
    description() {
      return this.pokemonInstance.pokemon.skill.description.replace(
        '?',
        this.pokemonInstance.pokemon.skill.amount[this.mainskillLevel - 1] + '' // convert to string
      )
    },
    mainskillImage() {
      if (this.pokemonInstance.pokemon.skill.name === mainskill.HELPER_BOOST.name) {
        return `/images/type/${this.pokemonInstance.pokemon.berry.type}.png`
      }

      return `/images/mainskill/${this.pokemonInstance.pokemon.skill.unit}.png`
    },
    pokemon() {
      return this.pokemonInstance.pokemon
    }
  },
  watch: {
    pokemon: {
      handler(newPokemon: pokemon.Pokemon) {
        if (this.pokemonInstance.skillLevel > 0) {
          this.mainskillLevel = this.pokemonInstance.skillLevel
        } else {
          const nrOfEvolutions = (newPokemon.maxCarrySize - newPokemon.carrySize) / 5
          this.mainskillLevel = 1 + nrOfEvolutions
        }
        this.$emit('update-skill-level', this.mainskillLevel)

        this.defaultValues = Array.from(
          { length: newPokemon.skill.maxLevel },
          (_, i) => i + 1
        ).reduce(
          (acc, val) => {
            acc[val] = val.toString()
            return acc
          },
          {} as Record<number, string>
        )
      }
    },
    mainskillLevel(newLevel: number) {
      this.$emit('update-skill-level', newLevel)
    }
  }
}
</script>

<style lang="scss">
.responsive-text {
  font-size: 0.875rem !important;
}

.responsive-text-small {
  font-size: 0.8rem !important;
}

@media (max-width: 360px) {
  .responsive-text {
    font-size: 0.7rem !important;
  }

  .responsive-text-small {
    font-size: 0.6rem !important;
  }
}
</style>
