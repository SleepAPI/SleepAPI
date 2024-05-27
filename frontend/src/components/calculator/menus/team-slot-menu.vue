<template>
  <v-dialog v-model="internalShow" max-width="600px">
    <v-card>
      <v-list>
        <v-list-item prepend-icon="mdi-plus-circle-outline" @click="emitSelection('Add')"
          >Add</v-list-item
        >
        <v-divider inset />
        <v-list-item prepend-icon="mdi-bookmark-outline" @click="emitSelection('Saved')"
          >Saved</v-list-item
        >
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TeamSlotMenu',
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
  emits: ['update-selected', 'update:show'],
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
    emitSelection(option: string) {
      this.$emit('update-selected', option)
      this.internalShow = false
    }
  }
})
</script>
