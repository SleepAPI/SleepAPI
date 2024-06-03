<template>
  <v-dialog v-model="internalShow" max-width="600px">
    <v-card>
      <v-list>
        <!-- Empty team slot -->
        <div v-if="emptySlot">
          <v-list-item prepend-icon="mdi-plus-circle-outline" @click="handleAddClick"
            >Add</v-list-item
          >
          <v-list-item prepend-icon="mdi-bookmark-outline">Saved</v-list-item>
        </div>
        <div v-else>
          <!-- Filled team slot  -->
          <v-list-item prepend-icon="mdi-pencil" @click="handleEditClick">Edit</v-list-item>
          <!-- TODO: change to filled bookmark AND text to Unsane if already saved -->
          <v-list-item prepend-icon="mdi-bookmark-outline" @click="savePokemon">Save</v-list-item>
          <v-list-item prepend-icon="mdi-content-copy">Duplicate</v-list-item>
          <v-list-item prepend-icon="mdi-delete">Remove</v-list-item>
        </div>
      </v-list>
    </v-card>
  </v-dialog>

  <v-dialog v-model="subDialog" max-width="600px" content-class="fixed-dialog-content">
    <component
      :is="currentDialogComponent"
      v-bind="currentDialogProps"
      @cancel="closeSubDialog"
    ></component>
  </v-dialog>
</template>

<script lang="ts">
import PokemonInput from '@/components/calculator/pokemon-input/pokemon-input.vue'
import PokemonSearch from '@/components/calculator/pokemon-input/pokemon-search.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamSlotMenu',
  components: {
    PokemonSearch,
    PokemonInput
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    memberIndex: {
      type: Number,
      required: true
    }
  },
  emits: ['update:show'],
  data: () => ({
    subDialog: false,
    currentDialogComponent: null as string | null,
    currentDialogProps: {}
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
      // TODO: lookup pokemon for team/member index in team store instead
      return true
    }
  },
  methods: {
    handleAddClick() {
      this.closeInternalDialog()
      this.openSubDialog('PokemonSearch', {
        memberIndex: this.memberIndex
      })
    },
    handleEditClick() {
      this.closeInternalDialog()
      this.openSubDialog('PokemonInput', {
        memberIndex: this.memberIndex
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
    closeInternalDialog() {
      this.internalShow = false
    },
    savePokemon() {
      // Your save logic
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
