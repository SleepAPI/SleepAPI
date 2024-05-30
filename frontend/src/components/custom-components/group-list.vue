<template>
  <v-list density="compact">
    <v-list-group v-for="group in data" :key="group.category" :value="group.category">
      <template #activator="{ props }">
        <v-list-item v-bind="props" :title="group.category"></v-list-item>
      </template>
      <v-list-item
        v-for="(option, i) in group.list"
        :key="i"
        :title="option"
        :value="option"
        :disabled="isOptionSelected(option)"
        @click="selectOption(option)"
      ></v-list-item>
    </v-list-group>
  </v-list>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export interface GroupData {
  category: string
  list: Array<string>
}

export default defineComponent({
  name: 'GroupList',
  props: {
    data: {
      type: Object as PropType<Array<GroupData>>,
      required: true,
      default: (): GroupData => ({
        category: '',
        list: []
      })
    },
    selectedOptions: {
      type: Array<string>,
      required: true,
      default: () => []
    }
  },
  emits: ['select-option'],
  methods: {
    selectOption(option: string) {
      this.$emit('select-option', option)
    },
    isOptionSelected(name: string) {
      return this.selectedOptions.some((selected) => selected === name)
    }
  }
})
</script>
