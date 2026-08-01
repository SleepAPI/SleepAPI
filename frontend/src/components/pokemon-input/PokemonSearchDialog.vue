<template>
  <v-dialog v-model="dialogStore.pokemonSearchDialog" max-width="600px">
    <PokemonSearch @cancel="dialogStore.closePokemonSearch" @save="handlePokemonSave" />
  </v-dialog>
</template>

<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import type { PokemonInstance } from 'sleepapi-common'
import PokemonSearch from './PokemonSearch.vue'

const dialogStore = useDialogStore()

const handlePokemonSave = (instance: PokemonInstance) => {
  dialogStore.handlePokemonSelected(instance)
}
</script>
