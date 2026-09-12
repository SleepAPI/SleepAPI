<template>
  <v-btn variant="text" class="text-h6" :text="pokemonInstance.name" @click="openEditDialog">
    <template #append>
      <v-icon size="24">mdi-pencil</v-icon>
    </template>
  </v-btn>

  <v-dialog id="pokemonNameDialog" v-model="isEditDialogOpen" max-width="600px">
    <v-card title="Change Name">
      <v-card-text class="pt-4 pb-0">
        <v-text-field
          v-model="editedName"
          :rules="[
            (v: any) => (v || '').length <= maxNameLength || `Description must be ${maxNameLength} characters or less`
          ]"
          :counter="maxNameLength"
          clearable
          rows="2"
          no-resize
          label="Pokemon Name"
          class="compact-control"
          autofocus
          variant="outlined"
          @focus="highlightText"
          @keydown.enter="saveEditDialog"
        ></v-text-field>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn id="rerollButton" icon @click="editedName = randomizeName()">
          <v-icon>mdi-dice-multiple</v-icon>
        </v-btn>
        <v-spacer />
        <v-btn id="cancelButton" @click="closeEditDialog">Cancel</v-btn>
        <v-btn id="saveButton" :disabled="remainingChars < 0" rounded="lg" color="primary" @click="saveEditDialog"
          >OK</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { useHighlightText } from '@/composables/highlight-text/use-highlight-text'
import { randomName } from '@/services/utils/name-utils'
import type { PokemonInstance } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'PokemonName',
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstance>,
      required: true
    }
  },
  setup() {
    const { highlightText } = useHighlightText()

    return { highlightText }
  },
  emits: ['update-name'],
  data: () => ({
    isEditDialogOpen: false,
    maxNameLength: 12,
    editedName: ''
  }),
  computed: {
    remainingChars() {
      return this.maxNameLength - (this.editedName?.length || 0)
    }
  },
  methods: {
    openEditDialog() {
      this.editedName = this.pokemonInstance.name
      this.isEditDialogOpen = true
    },
    closeEditDialog() {
      this.isEditDialogOpen = false
    },
    async saveEditDialog() {
      if (this.remainingChars >= 0) {
        if (this.remainingChars === this.maxNameLength) {
          this.editedName = this.pokemonInstance.name
        }
        this.$emit('update-name', this.editedName)
        this.isEditDialogOpen = false
      }
    },
    randomizeName() {
      return randomName(this.pokemonInstance.pokemon, 12, this.pokemonInstance.gender)
    }
  }
}
</script>
