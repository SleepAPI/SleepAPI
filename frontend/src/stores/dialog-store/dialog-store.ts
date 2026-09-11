import { defineStore } from 'pinia'
import type { PokemonInstanceExt } from 'sleepapi-common'
import { ref } from 'vue'

export const useDialogStore = defineStore('dialog', () => {
  // ==================== POKEMON SEARCH DIALOG ====================
  const pokemonSearchDialog = ref(false)
  const pokemonSearchCallback = ref<((pokemonInstance: PokemonInstanceExt) => void) | null>(null)
  const pokemonSearchCurrentInstance = ref<PokemonInstanceExt | null>(null)

  const openPokemonSearch = (
    callback: (pokemonInstance: PokemonInstanceExt) => void,
    currentInstance?: PokemonInstanceExt
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

  const handlePokemonSelected = (pokemonInstance: PokemonInstanceExt) => {
    if (pokemonSearchCallback.value) {
      pokemonSearchCallback.value(pokemonInstance)
    }
    closePokemonSearch()
  }

  // ==================== POKEMON INPUT DIALOG ====================
  const pokemonInputDialog = ref(false)
  const pokemonInputCallback = ref<((pokemon: PokemonInstanceExt) => void) | null>(null)
  const pokemonInputProps = ref<{ preSelectedPokemonInstance: PokemonInstanceExt | null }>({
    preSelectedPokemonInstance: null
  })

  const openPokemonInput = (
    callback: (pokemon: PokemonInstanceExt) => void,
    preSelectedPokemonInstance: PokemonInstanceExt
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

  const savePokemonInput = (pokemon: PokemonInstanceExt) => {
    if (pokemonInputCallback.value) {
      pokemonInputCallback.value(pokemon)
    }
    closePokemonInput()
  }

  // ==================== FILLED SLOT DIALOG ====================
  const filledSlotDialog = ref(false)
  const filledSlotProps = ref<{
    pokemon: PokemonInstanceExt | null
    fullTeam: boolean
    slotIndex?: number
    onUpdate?: (pokemon: PokemonInstanceExt) => void
    onDuplicate?: () => void
    onToggleSaved?: (state: boolean) => void
    onRemove?: () => void
  }>({
    pokemon: null,
    fullTeam: false,
    slotIndex: undefined
  })

  const openFilledSlot = (
    pokemon: PokemonInstanceExt,
    fullTeam: boolean,
    slotIndexOrCallbacks:
      | number
      | {
          onUpdate?: (pokemonInstance: PokemonInstanceExt) => void
          onDuplicate?: () => void
          onToggleSaved?: (state: boolean) => void
          onRemove?: () => void
        },
    maybeCallbacks?: {
      onUpdate?: (pokemonInstance: PokemonInstanceExt) => void
      onDuplicate?: () => void
      onToggleSaved?: (state: boolean) => void
      onRemove?: () => void
    }
  ) => {
    const slotIndex = typeof slotIndexOrCallbacks === 'number' ? slotIndexOrCallbacks : undefined
    const callbacks = typeof slotIndexOrCallbacks === 'number' ? (maybeCallbacks ?? {}) : slotIndexOrCallbacks
    filledSlotProps.value = {
      pokemon,
      fullTeam,
      slotIndex,
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
      slotIndex: undefined,
      onUpdate: undefined,
      onDuplicate: undefined,
      onToggleSaved: undefined,
      onRemove: undefined
    }
  }

  // ==================== TEAM SCHEDULE DIALOG ====================
  const scheduleDialog = ref(false)
  const scheduleSlotIndex = ref<number | null>(null)

  const openSchedule = (slotIndex: number) => {
    scheduleSlotIndex.value = slotIndex
    scheduleDialog.value = true
  }

  const closeSchedule = () => {
    scheduleDialog.value = false
    scheduleSlotIndex.value = null
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
    closeFilledSlot,

    // Team schedule
    scheduleDialog,
    scheduleSlotIndex,
    openSchedule,
    closeSchedule
  }
})
