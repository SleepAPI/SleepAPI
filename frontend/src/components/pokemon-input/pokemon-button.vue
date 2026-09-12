<template>
  <v-btn icon size="120" color="transparent" elevation="0" class="flex-center" @click="openMenu">
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

<script setup lang="ts">
import { pokemonImage } from '@/services/utils/image-utils'
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import type { PokemonInstance } from 'sleepapi-common'

const props = defineProps<{
  pokemonInstance: PokemonInstance
}>()

const emit = defineEmits<{
  'update-pokemon': [pokemon: PokemonInstance]
}>()

const dialogStore = useDialogStore()

const openMenu = () => {
  dialogStore.openPokemonSearch((pokemon: PokemonInstance) => {
    emit('update-pokemon', pokemon)
  }, props.pokemonInstance)
}
</script>

<style lang="scss">
.v-btn > * {
  // Not sure why, but this makes the click area smaller
  pointer-events: none;
}
</style>
