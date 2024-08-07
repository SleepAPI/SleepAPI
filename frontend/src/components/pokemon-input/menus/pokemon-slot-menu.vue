<template>
  <v-dialog v-model="internalShow" max-width="600px">
    <v-card>
      <v-list>
        <!-- Empty  slot -->
        <div v-if="emptySlot" id="emptyMenu">
          <v-list-item id="addButton" prepend-icon="mdi-plus-circle-outline" @click="handleAddClick"
            >Add</v-list-item
          >
          <!-- TODO: implement and then remove disabled -->
          <v-list-item prepend-icon="mdi-bookmark-outline" disabled @click="openCollection"
            >Saved</v-list-item
          >
        </div>
        <div v-else id="filledMenu">
          <!-- Filled slot  -->
          <v-list-item id="editButton" prepend-icon="mdi-pencil" @click="handleEditClick"
            >Edit</v-list-item
          >
          <v-list-item
            id="saveButton"
            :disabled="!userStore.loggedIn"
            :prepend-icon="savedState.state ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
            @click="save"
            >{{ savedState.state ? 'Unsave' : 'Save' }}</v-list-item
          >
          <v-list-item
            id="duplicateButton"
            :disabled="fullTeam"
            prepend-icon="mdi-content-copy"
            @click="duplicate"
            >Duplicate</v-list-item
          >
          <v-list-item id="removeButton" prepend-icon="mdi-delete" @click="remove"
            >Remove</v-list-item
          >
        </div>
      </v-list>
    </v-card>
  </v-dialog>

  <v-dialog v-model="subDialog" max-width="600px" content-class="fixed-dialog-content">
    <component
      :is="currentDialogComponent"
      v-bind="currentDialogProps"
      @cancel="closeSubDialog"
      @save="updatePokemonInstance"
    ></component>
  </v-dialog>
</template>

<script lang="ts">
import PokemonInput from '@/components/pokemon-input/pokemon-input.vue'
import PokemonSearch from '@/components/pokemon-input/pokemon-search.vue'
import { useUserStore } from '@/stores/user-store'
import type { PokemonInstanceExt } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'PokemonSlotMenu',
  components: {
    PokemonSearch,
    PokemonInput
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    pokemonFromPreExist: {
      type: Object as PropType<PokemonInstanceExt>,
      required: false,
      default: undefined
    },
    fullTeam: {
      type: Boolean,
      required: true
    }
  },
  emits: [
    'update:show',
    'update-pokemon',
    'duplicate-pokemon',
    'toggle-saved-pokemon',
    'remove-pokemon'
  ],
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  data: () => ({
    subDialog: false,
    currentDialogComponent: null as string | null,
    currentDialogProps: {},
    savedState: {
      state: false,
      serverState: false,
      timer: null as ReturnType<typeof setTimeout> | null
    }
  }),
  computed: {
    internalShow: {
      get() {
        return this.show
      },
      set(value: boolean) {
        this.$emit('update:show', value)
      }
    },
    emptySlot() {
      return this.pokemonFromPreExist === undefined
    }
  },
  mounted() {
    const initialSavedState = this.pokemonFromPreExist?.saved ?? false
    this.savedState.serverState = initialSavedState
    this.savedState.state = initialSavedState
  },
  methods: {
    handleAddClick() {
      this.closeSlotMenuDialog()
      this.openSubDialog('PokemonSearch', {})
    },
    handleEditClick() {
      this.closeSlotMenuDialog()
      this.openSubDialog('PokemonInput', {
        pokemonFromPreExist: this.pokemonFromPreExist
      })
    },
    openSubDialog(dialogComponent: string, props: object) {
      this.currentDialogComponent = dialogComponent
      this.currentDialogProps = props
      this.subDialog = true
    },
    closeSubDialog() {
      this.subDialog = false
    },
    closeSlotMenuDialog() {
      this.internalShow = false
    },
    async duplicate() {
      if (!this.pokemonFromPreExist) {
        console.error("Can't call duplicate on empty slot, contact developer")
      } else {
        this.$emit('duplicate-pokemon', this.pokemonFromPreExist)
      }
    },
    save() {
      this.savedState.state = !this.savedState.state
      this.resetSaveTimer()
    },
    resetSaveTimer() {
      if (this.savedState.timer) {
        clearTimeout(this.savedState.timer)
      }
      this.savedState.timer = setTimeout(this.toggleSavedState, 1000)
    },
    toggleSavedState() {
      if (this.savedState.state !== this.savedState.serverState) {
        this.savedState.serverState = this.savedState.state
        this.$emit('toggle-saved-pokemon', this.savedState.state)
      }
    },
    remove() {
      if (!this.pokemonFromPreExist) {
        console.error("Can't call remove on empty slot, contact developer")
      } else {
        this.$emit('remove-pokemon', this.pokemonFromPreExist)
        this.closeSlotMenuDialog()
      }
    },
    openCollection() {
      // TODO: call backend for all pokemon for this user that are saved
      console.log('Not implemented..') // TODO:
    },
    updatePokemonInstance(pokemonInstance: PokemonInstanceExt) {
      this.$emit('update-pokemon', pokemonInstance)
      this.closeSubDialog()
    }
  }
})
</script>

<style lang="scss">
// I would rather avoid this, but on Android PWA the dialog jumps with keyboard open
.fixed-dialog-content {
  position: fixed !important;
  top: 20px !important;
}
</style>
