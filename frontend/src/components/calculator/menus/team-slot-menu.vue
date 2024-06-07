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
          <v-list-item
            :prepend-icon="saved ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
            @click="savePokemon"
            >{{ saved ? 'Unsave' : 'Save' }}</v-list-item
          >
          <v-list-item prepend-icon="mdi-content-copy">Duplicate</v-list-item>
          <v-list-item prepend-icon="mdi-delete" @click="removePokemon">Remove</v-list-item>
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
import { useTeamStore } from '@/stores/team/team-store'
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
  setup() {
    const teamStore = useTeamStore()
    return { teamStore }
  },
  data: () => ({
    subDialog: false,
    currentDialogComponent: null as string | null,
    currentDialogProps: {},
    saved: false
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
      return this.teamStore.getPokemon(this.memberIndex) === undefined
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
      // TODO: call server to save
      // TODO: be clever here, people will probably spam save unsave because haha, we should probably debounce or send right before unmount if value was diff from start
      this.saved = !this.saved
    },
    removePokemon() {
      // TODO: remove from cache
      // TODO: send to server to remove from team_member table, pokemon should also be removed if not saved
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
