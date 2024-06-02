<template>
  <v-btn
    variant="text"
    :class="`${pokemon ? 'text-h6' : 'text-body-1'}`"
    :text="name"
    :disabled="pokemon === undefined"
    @click="openEditDialog"
  >
    <template v-if="pokemon" #append>
      <v-icon size="24">mdi-pencil</v-icon>
    </template>
  </v-btn>

  <v-dialog id="pokemonNameDialog" v-model="isEditDialogOpen" max-width="80%">
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
        <v-btn id="rerollButton" icon @click="editedName = rerollName()">
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
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { faker } from '@faker-js/faker/locale/en'
import { pokemon } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'PokemonName',
  props: {
    pokemon: {
      type: Object as PropType<pokemon.Pokemon>,
      required: false,
      default: undefined
    }
  },
  emits: ['update-name'],
  data: () => ({
    name: 'Choose a Pokémon',
    isEditDialogOpen: false,
    maxNameLength: 12,
    editedName: ''
  }),
  computed: {
    remainingChars() {
      return this.maxNameLength - (this.editedName?.length || 0)
    }
  },
  watch: {
    pokemon: {
      handler() {
        this.name = this.rerollName()
        this.$emit('update-name', this.name)
      },
      immediate: true
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
        this.name = this.editedName
        this.$emit('update-name', this.name)
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
    rerollName() {
      let name = faker.person.firstName()
      while (name.length > this.maxNameLength) {
        // TODO: we could save possible genders on each mon and pass, some mons can only be one gender, some have higher likelihood
        name = faker.person.firstName()
      }
      return name
    }
  }
}
</script>
