<template>
  <v-dialog v-model="pokemonMenu" max-width="600px" class="flex-center">
    <template #activator="{ props }">
      <v-btn icon size="150" color="#19122400" v-bind="props" elevation="0" @click="openMenu">
        <v-badge icon="mdi-pencil" color="primary" offset-x="50" offset-y="30">
          <v-img
            :src="`/images/pokemon/${pokemon.name.toLowerCase()}.png`"
            max-height="150px"
            width="180px"
          />
        </v-badge>
      </v-btn>
    </template>

    <v-card>
      <GroupList
        :data="pokedexStore.groupedPokedex"
        :selected-options="[pokemon.name]"
        @select-option="selectPokemon"
        @cancel="closeMenu"
      />
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import GroupList from '@/components/custom-components/group-list.vue'
import { usePokedexStore } from '@/stores/pokedex-store/pokedex-store'
import { pokemon } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'PokemonButton',
  components: {
    GroupList
  },
  props: {
    pokemon: {
      type: Object as PropType<pokemon.Pokemon>,
      required: true
    }
  },
  emits: ['update-pokemon'],
  setup() {
    const pokedexStore = usePokedexStore()
    return { pokedexStore }
  },
  data: () => ({
    pokemonMenu: false
  }),
  methods: {
    openMenu() {
      this.pokemonMenu = true
    },
    closeMenu() {
      this.pokemonMenu = false
    },
    selectPokemon(name: string) {
      const pkmn = pokemon.COMPLETE_POKEDEX.find((p) => p.name.toLowerCase() === name.toLowerCase())
      if (!pkmn) {
        console.error('Error selecting Pokémon')
        return
      }
      this.pokemonMenu = false
      this.$emit('update-pokemon', pkmn)
    }
  }
}
</script>
