<template>
  <v-dialog v-model="dialogStore.filledSlotDialog" max-width="600px">
    <v-card v-if="dialogStore.filledSlotProps.pokemon" :loading="savedState.loading">
      <v-list>
        <div id="filledMenu">
          <v-list-item id="editButton" prepend-icon="mdi-pencil" @click="handleEditClick">Edit</v-list-item>
          <v-list-item id="scheduleButton" prepend-icon="mdi-clock-outline" @click="openSchedule">Schedule</v-list-item>
          <v-list-item
            id="saveButton"
            :disabled="!userStore.loggedIn"
            :prepend-icon="savedState.state ? 'mdi-checkbox-marked-outline' : 'mdi-checkbox-blank-outline'"
            @click="save"
            >{{ savedState.state ? 'Remove from Pokebox' : 'Save to Pokebox' }}</v-list-item
          >
          <v-list-item
            id="duplicateButton"
            :disabled="dialogStore.filledSlotProps.fullTeam"
            prepend-icon="mdi-content-copy"
            @click="duplicate"
            >Duplicate</v-list-item
          >
          <v-list-item id="removeButton" prepend-icon="mdi-delete" @click="remove">Remove</v-list-item>
        </div>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog-store/dialog-store'
import { useUserStore } from '@/stores/user-store'
import { ref, watch } from 'vue'

const userStore = useUserStore()
const dialogStore = useDialogStore()

const savedState = ref({
  state: false,
  serverState: false,
  loading: false,
  timer: null as ReturnType<typeof setTimeout> | null
})

// Watch for Pokemon changes to update saved state
watch(
  () => dialogStore.filledSlotProps.pokemon,
  (newPokemon) => {
    if (newPokemon) {
      const initialSavedState = newPokemon.saved ?? false
      savedState.value.serverState = initialSavedState
      savedState.value.state = initialSavedState
    }
  },
  { immediate: true }
)

const handleEditClick = () => {
  const pokemon = dialogStore.filledSlotProps.pokemon
  const onUpdate = dialogStore.filledSlotProps.onUpdate
  if (!pokemon) return

  dialogStore.closeFilledSlot()
  dialogStore.openPokemonInput((editedPokemon) => {
    if (onUpdate) {
      onUpdate(editedPokemon)
    }
  }, pokemon)
}

const openSchedule = () => {
  const slotIndex = dialogStore.filledSlotProps.slotIndex
  if (slotIndex === undefined) return
  dialogStore.closeFilledSlot()
  dialogStore.openSchedule(slotIndex)
}

const save = () => {
  savedState.value.loading = true
  resetSaveTimer()
}

const resetSaveTimer = () => {
  if (savedState.value.timer) {
    clearTimeout(savedState.value.timer)
  }
  savedState.value.timer = setTimeout(toggleSavedState, 1000)
}

const toggleSavedState = () => {
  savedState.value.state = !savedState.value.state
  if (savedState.value.state !== savedState.value.serverState) {
    savedState.value.serverState = savedState.value.state
    savedState.value.loading = false
    if (dialogStore.filledSlotProps.onToggleSaved) {
      dialogStore.filledSlotProps.onToggleSaved(savedState.value.state)
    }
  }
}

const duplicate = () => {
  dialogStore.filledSlotProps.onDuplicate?.()
}

const remove = () => {
  dialogStore.filledSlotProps.onRemove?.()
}
</script>
