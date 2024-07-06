<template>
  <v-dialog v-model="internalShow" max-width="600px">
    <v-card>
      <v-list>
        <!-- Empty team slot -->
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
          <!-- Filled team slot  -->
          <v-list-item id="editButton" prepend-icon="mdi-pencil" @click="handleEditClick"
            >Edit</v-list-item
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
    ></component>
  </v-dialog>
</template>

<script lang="ts">
import PokemonInput from '@/components/calculator/pokemon-input/pokemon-input.vue'
import PokemonSearch from '@/components/calculator/pokemon-input/pokemon-search.vue'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { MAX_TEAM_MEMBERS } from '@/types/member/instanced'
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
    const userStore = useUserStore()
    return { teamStore, userStore }
  },
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
    maybePokemon() {
      return this.teamStore.getPokemon(this.memberIndex)
    },
    emptySlot() {
      return this.maybePokemon === undefined
    },
    fullTeam() {
      return this.teamStore.getTeamSize === MAX_TEAM_MEMBERS
    }
  },
  methods: {
    handleAddClick() {
      this.closeTeamSlotMenuDialog()
      this.openSubDialog('PokemonSearch', {
        memberIndex: this.memberIndex
      })
    },
    handleEditClick() {
      this.closeTeamSlotMenuDialog()
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
    closeTeamSlotMenuDialog() {
      this.internalShow = false
    },
    async duplicate() {
      await this.teamStore.duplicateMember(this.memberIndex)
    },
    async remove() {
      await this.teamStore.removeMember(this.memberIndex)
      this.closeTeamSlotMenuDialog()
    },
    openCollection() {
      console.log('Not implemented..') // TODO:

      // TODO: this should load generic collection component, in dialog
      // TODO: in mounted of collection component we should clean up pokemon-store:
      // TODO:    get all pokemon for this user from server and I think we can probably just overwrite the entire pokemon-store?
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
