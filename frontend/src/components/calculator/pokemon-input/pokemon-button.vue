<template>
  <v-dialog v-model="pokemonMenu">
    <template #activator="{ props }">
      <v-btn
        icon
        size="150"
        color="#19122400"
        v-bind="props"
        elevation="0"
        @click="pokemonMenu = true"
      >
        <v-img
          v-if="pokemon"
          :src="`/images/pokemon/${pokemon.name.toLowerCase()}.png`"
          max-height="150px"
          width="180px"
        />
        <v-img v-else src="/images/pokemon/unknown.png" max-height="150px" width="180px" />
      </v-btn>
    </template>

    <v-container>
      <GroupList
        :data="pokedex"
        :selected-options="pokemon ? [pokemon.name] : []"
        @select-option="selectPokemon"
      />
    </v-container>
  </v-dialog>
</template>

<script lang="ts">
import GroupList, { type GroupData } from '@/components/custom-components/group-list.vue'
import { pokemon } from 'sleepapi-common'

export default {
  name: 'PokemonButton',
  components: {
    GroupList
  },
  emits: ['select-pokemon'],
  data: () => ({
    pokemon: undefined as pokemon.Pokemon | undefined,
    pokemonMenu: false,
    pokedex: [] as GroupData[]
  }),
  mounted() {
    this.pokedex = this.populatePokedex()
  },
  methods: {
    selectPokemon(name: string) {
      const pkmn = pokemon.COMPLETE_POKEDEX.find((p) => p.name.toLowerCase() === name.toLowerCase())
      if (!pkmn) {
        console.error('Error selecting Pokémon')
        return
      }
      this.pokemon = pkmn
      this.pokemonMenu = false
      this.$emit('select-pokemon', pkmn)
    },
    // TODO: this seems to take a bit of time, perhaps we can lazy load instead of compute on pokemon button click
    populatePokedex(): GroupData[] {
      const categories = ['ingredient', 'berry', 'skill']
      const completePokedex = pokemon.COMPLETE_POKEDEX.sort()

      return categories.map((category) => {
        return {
          category,
          list: completePokedex
            .filter((pkmn) => pkmn.specialty === category)
            .map((pkmn) => pkmn.name[0].toUpperCase() + pkmn.name.slice(1).toLowerCase())
        }
      })
    }
  }
}
</script>
