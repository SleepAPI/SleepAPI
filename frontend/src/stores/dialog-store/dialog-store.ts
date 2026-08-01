import { defineStore } from 'pinia'
import type { PokemonInstance } from 'sleepapi-common'
import { ref } from 'vue'

export const useDialogStore = defineStore('dialog', () => {
  // ==================== POKEMON SEARCH DIALOG ====================
  const pokemonSearchDialog = ref(false)
  const pokemonSearchCallback = ref<((pokemonInstance: PokemonInstance) => void) | null>(null)
  const pokemonSearchCurrentInstance = ref<PokemonInstance | null>(null)

  const openPokemonSearch = (
    callback: (pokemonInstance: PokemonInstance) => void,
    currentInstance?: PokemonInstance
  ) => {
    pokemonSearchCallback.value = callback
    pokemonSearchCurrentInstance.value = currentInstance || null
    pokemonSearchDialog.value = true
  }

  const closePokemonSearch = () => {
    pokemonSearchDialog.value = false
    pokemonSearchCallback.value = null
    pokemonSearchCurrentInstance.value = null
  }

  const handlePokemonSelected = (pokemonInstance: PokemonInstance) => {
    if (pokemonSearchCallback.value) {
      pokemonSearchCallback.value(pokemonInstance)
    }
    closePokemonSearch()
  }

  // ==================== POKEMON INPUT DIALOG ====================
  const pokemonInputDialog = ref(false)
  const pokemonInputCallback = ref<((pokemon: PokemonInstance) => void) | null>(null)
  const pokemonInputProps = ref<{ preSelectedPokemonInstance: PokemonInstance | null }>({
    preSelectedPokemonInstance: null
  })

  const openPokemonInput = (
    callback: (pokemon: PokemonInstance) => void,
    preSelectedPokemonInstance: PokemonInstance
  ) => {
    pokemonInputCallback.value = callback
    pokemonInputProps.value = { preSelectedPokemonInstance }
    pokemonInputDialog.value = true
  }

  const closePokemonInput = () => {
    pokemonInputDialog.value = false
    pokemonInputCallback.value = null
    pokemonInputProps.value = { preSelectedPokemonInstance: null }
  }

  const savePokemonInput = (pokemon: PokemonInstance) => {
    if (pokemonInputCallback.value) {
      pokemonInputCallback.value(pokemon)
    }
    closePokemonInput()
  }

  // ==================== FILLED SLOT DIALOG ====================
  const filledSlotDialog = ref(false)
  const filledSlotProps = ref<{
    pokemon: PokemonInstance | null
    fullTeam: boolean
    onUpdate?: (pokemon: PokemonInstance) => void
    onDuplicate?: () => void
    onToggleSaved?: (state: boolean) => void
    onRemove?: () => void
  }>({
    pokemon: null,
    fullTeam: false
  })

  const openFilledSlot = (
    pokemon: PokemonInstance,
    fullTeam: boolean,
    callbacks: {
      onUpdate?: (pokemonInstance: PokemonInstance) => void
      onDuplicate?: () => void
      onToggleSaved?: (state: boolean) => void
      onRemove?: () => void
    }
  ) => {
    filledSlotProps.value = {
      pokemon,
      fullTeam,
      onUpdate: callbacks.onUpdate,
      onDuplicate: callbacks.onDuplicate,
      onToggleSaved: callbacks.onToggleSaved,
      onRemove: callbacks.onRemove
        ? () => {
            callbacks.onRemove?.()
            closeFilledSlot()
          }
        : undefined
    }
    filledSlotDialog.value = true
  }

  const closeFilledSlot = () => {
    filledSlotDialog.value = false
    filledSlotProps.value = {
      pokemon: null,
      fullTeam: false,
      onUpdate: undefined,
      onDuplicate: undefined,
      onToggleSaved: undefined,
      onRemove: undefined
    }
  }

  // ==================== PUBLIC API ====================
  return {
    // Pokemon Search
    pokemonSearchDialog,
    pokemonSearchCallback,
    pokemonSearchCurrentInstance,
    openPokemonSearch,
    closePokemonSearch,
    handlePokemonSelected,

    // Pokemon Input
    pokemonInputDialog,
    pokemonInputCallback,
    pokemonInputProps,
    openPokemonInput,
    closePokemonInput,
    savePokemonInput,

    // Filled Slot
    filledSlotDialog,
    filledSlotProps,
    openFilledSlot,
    closeFilledSlot
  }
})
