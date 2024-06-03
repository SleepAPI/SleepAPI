<template>
  <v-card v-if="!pokemon">
    <GroupList
      :data="pokedexStore.groupedPokedex"
      :selected-options="[]"
      @select-option="selectPokemon"
      @cancel="closeMenu"
    />
  </v-card>
  <PokemonInput
    v-else
    :selected-pokemon="pokemon"
    :member-index="memberIndex"
    @cancel="closeMenu"
  />
</template>

<script lang="ts">
import PokemonInput from '@/components/calculator/pokemon-input/pokemon-input.vue'
import GroupList from '@/components/custom-components/group-list.vue'
import { usePokedexStore } from '@/stores/pokedex-store/pokedex-store'
import { pokemon } from 'sleepapi-common'

export default {
  name: 'PokemonSearch',
  components: {
    GroupList,
    PokemonInput
  },
  props: {
    memberIndex: {
      type: Number,
      required: true
    }
  },
  emits: ['cancel'],
  setup() {
    const pokedexStore = usePokedexStore()
    return { pokedexStore }
  },
  data: () => ({
    pokemon: undefined as pokemon.Pokemon | undefined
  }),
  methods: {
    closeMenu() {
      this.$emit('cancel')
    },
    selectPokemon(name: string) {
      const pkmn = pokemon.COMPLETE_POKEDEX.find((p) => p.name.toLowerCase() === name.toLowerCase())
      if (!pkmn) {
        console.error('Error selecting Pokémon')
        return
      }
      this.pokemon = pkmn
    }
  }
}
</script>
