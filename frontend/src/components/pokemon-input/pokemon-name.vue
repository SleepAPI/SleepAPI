<template>
  <v-btn variant="text" class="text-h6" :text="name" @click="openEditDialog">
    <template #append>
      <v-icon size="24">mdi-pencil</v-icon>
    </template>
  </v-btn>

  <v-dialog id="pokemonNameDialog" v-model="isEditDialogOpen" max-width="600px">
    <v-card title="Change Name">
      <v-card-text class="pt-4 pb-0">
        <v-textarea
          v-model="editedName"
          :rules="[
            (v) =>
              (v || '').length <= maxNameLength ||
              `Description must be ${maxNameLength} characters or less`
          ]"
          :counter="maxNameLength"
          clearable
          rows="2"
          no-resize
          label="Team Name"
          class="compact-control"
          @input="filterInput"
          @keydown.enter="saveEditDialog"
        ></v-textarea>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-btn id="rerollButton" icon @click="editedName = randomizeName()">
          <v-icon>mdi-dice-multiple</v-icon>
        </v-btn>
        <v-spacer />
        <v-btn id="cancelButton" @click="closeEditDialog">Cancel</v-btn>
        <v-btn
          id="saveButton"
          :disabled="remainingChars < 0"
          rounded="lg"
          color="primary"
          @click="saveEditDialog"
          >OK</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { randomName } from '@/services/utils/name-utils'
import { useTeamStore } from '@/stores/team/team-store'

export default {
  name: 'PokemonName',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  emits: ['update-name'],
  setup() {
    const teamStore = useTeamStore()
    return { teamStore }
  },
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
  mounted() {
    if (this.name === '') {
      this.$emit('update-name', this.randomizeName())
    }
  },
  methods: {
    openEditDialog() {
      this.editedName = this.name
      this.isEditDialogOpen = true
    },
    closeEditDialog() {
      this.isEditDialogOpen = false
    },
    async saveEditDialog() {
      if (this.remainingChars >= 0) {
        if (this.remainingChars === this.maxNameLength) {
          this.editedName = this.name
        }
        this.$emit('update-name', this.editedName)
        this.isEditDialogOpen = false
      }
    },
    filterInput(event: Event) {
      const input = event.target as HTMLInputElement
      const regex = /^[a-zA-Z0-9 ]*$/
      if (!regex.test(input.value)) {
        this.editedName = this.editedName.replace(/[^a-zA-Z0-9 ]/g, '')
      }
    },
    randomizeName() {
      return randomName(12)
    }
  }
}
</script>
