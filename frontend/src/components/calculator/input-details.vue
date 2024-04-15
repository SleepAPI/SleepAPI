<template>
  <v-dialog v-model="showDialog" @click:outside="closeDialog">
    <v-card>
      <v-card-title class="text-h5">Choose a Pokémon</v-card-title>
      <v-card-text>
        <v-select v-model="selectedOption" :items="options" label="Select"></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text="Close" @click="closeDialog"></v-btn>
        <v-btn color="primary" text="Save" @click="emitSelection"></v-btn>
      </v-card-actions>
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
    }
  }
})
</script>
