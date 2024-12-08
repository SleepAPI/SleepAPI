<template>
  <v-card v-if="!pokemon">
    <GroupList
      :data="pokedexStore.groupedPokedex"
      :selected-options="[]"
      @select-option="selectPokemon"
      @cancel="closeMenu"
    />
  </v-card>
  <PokemonInput v-else :pokemon-from-search="pokemon" @cancel="closeMenu" />
</template>

<script lang="ts">
import GroupList from '@/components/custom-components/group-list.vue'
import PokemonInput from '@/components/pokemon-input/pokemon-input.vue'
import { usePokedexStore } from '@/stores/pokedex-store/pokedex-store'
import { COMPLETE_POKEDEX, type Pokemon } from 'sleepapi-common'

export default {
  name: 'PokemonSearch',
  components: {
    GroupList,
    PokemonInput
  },
  emits: ['cancel'],
  setup() {
    const pokedexStore = usePokedexStore()
    return { pokedexStore }
  },
  data: () => ({
    pokemon: undefined as Pokemon | undefined
  }),
  methods: {
    closeMenu() {
      this.$emit('cancel')
    },
    selectPokemon(name: string) {
      const pkmn = COMPLETE_POKEDEX.find((p) => p.name.toLowerCase() === name.toLowerCase())
      if (!pkmn) {
        console.error('Error selecting Pokémon')
        return
      }
      this.pokemon = pkmn
    }
  }
}
</script>
