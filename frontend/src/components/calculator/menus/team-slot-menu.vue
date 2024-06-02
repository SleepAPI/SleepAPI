<template>
  <v-dialog v-model="internalShow" max-width="600px">
    <v-card>
      <v-list>
        <!-- Empty team slot -->
        <div v-if="emptySlot">
          <v-list-item
            prepend-icon="mdi-plus-circle-outline"
            @click="openSubDialog('PokemonSearch')"
            >Add</v-list-item
          >
          <v-list-item prepend-icon="mdi-bookmark-outline">Saved</v-list-item>
        </div>
        <div v-else>
          <!-- Filled team slot  -->
          <v-list-item prepend-icon="mdi-pencil">Edit</v-list-item>
          <!-- TODO: change to filled bookmark AND text to Unsane if already saved -->
          <v-list-item prepend-icon="mdi-bookmark-outline" @click="savePokemon">Save</v-list-item>
          <v-list-item prepend-icon="mdi-content-copy">Duplicate</v-list-item>
          <v-list-item prepend-icon="mdi-delete">Remove</v-list-item>
        </div>
      </v-list>
    </v-card>
  </v-dialog>

  <v-dialog v-model="subDialog" max-width="600px">
    <component :is="currentDialogComponent" @cancel="closeSubDialog"></component>
  </v-dialog>
</template>

<script lang="ts">
import PokemonSearch from '@/components/calculator/pokemon-input/pokemon-search.vue'

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamSlotMenu',
  components: {
    PokemonSearch
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    emptySlot: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:show'],
  data: () => ({
    subDialog: false,
    currentDialogComponent: null as string | null
  }),
  computed: {
    internalShow: {
      get() {
        return this.show
      },
      set(value: boolean) {
        this.$emit('update:show', value)
      }
    }
  },
  methods: {
    openSubDialog(dialogComponent: string) {
      this.internalShow = false
      this.currentDialogComponent = dialogComponent
      this.subDialog = true
    },
    closeSubDialog() {
      this.subDialog = false
    },
    savePokemon() {
      //
    }
  }
})
</script>
