<template>
  <v-dialog v-model="pokemonMenu" max-width="550px" class="flex-center">
    <template #activator="{ props }">
      <v-btn icon size="120" color="transparent" v-bind="props" elevation="0" class="flex-center" @click="openMenu">
        <v-badge icon="mdi-pencil" color="primary" offset-x="30" offset-y="40">
          <v-img
            :src="
              pokemonImage({
                pokemonName: pokemonInstance.pokemon.name,
                shiny: pokemonInstance.shiny
              })
            "
            height="150px"
            width="150px"
            cover
          />
        </v-badge>
      </v-btn>
    </template>

    <v-card>
      <GroupList
        :data="pokedexStore.groupedPokedex"
        :selected-options="[pokemonInstance.name]"
        @select-option="selectPokemon"
        @cancel="closeMenu"
      />
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import GroupList from '@/components/custom-components/group-list.vue'
import { pokemonImage } from '@/services/utils/image-utils'
import { usePokedexStore } from '@/stores/pokedex-store/pokedex-store'
import { COMPLETE_POKEDEX, type PokemonInstanceExt } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'PokemonButton',
  components: {
    GroupList
  },
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstanceExt>,
      required: true
    }
  },
  emits: ['update-pokemon'],
  setup() {
    const pokedexStore = usePokedexStore()
    return { pokedexStore, pokemonImage }
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
      const pkmn = COMPLETE_POKEDEX.find((p) => p.name.toLowerCase() === name.toLowerCase())
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

<style lang="scss">
.v-btn > * {
  // Not sure why, but this makes the click area smaller
  pointer-events: none;
}
</style>
