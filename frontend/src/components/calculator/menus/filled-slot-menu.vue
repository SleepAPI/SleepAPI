<template>
  <v-dialog v-model="showDialog" @click:outside="closeDialog">
    <v-card>
      <v-list>
        <v-list-item prepend-icon="mdi-plus-circle-outline" @click="toggleAddPokemon"
          >Add</v-list-item
        >
        <v-divider inset />
        <v-list-item prepend-icon="mdi-bookmark-outline" @click="toggleAddPokemon"
          >Saved</v-list-item
        >
        <v-divider inset />
        <v-list-item prepend-icon="mdi-content-copy" @click="toggleAddPokemon"
          >Duplicate</v-list-item
        >
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { pokemon } from 'sleepapi-common'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'InputDetails',
  props: {
    show: Boolean
  },
  emits: ['update-selected', 'close-dialog'],
  data: () => ({
    showDialog: false,
    selectedOption: 'Abomasnow',
    options: pokemon.COMPLETE_POKEDEX.map((pkmn) => pkmn.name).sort()
  }),
  watch: {
    show() {
      this.showDialog = this.show
    }
  },
  mounted() {
    this.showDialog = this.show
  },
  methods: {
    closeDialog() {
      this.$emit('update-selected', this.selectedOption)
      this.$emit('close-dialog', false)
    },
    emitSelection() {
      this.$emit('update-selected', this.selectedOption)
      this.$emit('close-dialog', false)
    },
    toggleAddPokemon() {
      // TODO: this.showAddPokemon = true
    }
  }
})
</script>
