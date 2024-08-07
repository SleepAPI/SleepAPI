<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="searchQuery"
          label="Search for your Pokémon"
          hide-details
          no-resize
          autofocus
          @keydown.enter="selectFirstOption"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-list v-model:opened="openedGroups" density="compact" style="height: 50dvh">
      <v-list-group v-for="group in filteredData" :key="group.category" :value="group.category">
        <template #activator="{ props }">
          <v-list-item v-bind="props" :title="title(group.category)"></v-list-item>
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
    <v-row>
      <v-col cols="12">
        <v-btn
          class="w-100 responsive-text"
          size="large"
          rounded="lg"
          color="secondary"
          @click="cancel"
          >Cancel</v-btn
        >
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { capitalize } from 'sleepapi-common'
import { defineComponent } from 'vue'

export interface GroupData {
  category: string
  list: Array<string>
}

export default defineComponent({
  name: 'GroupList',
  props: {
    data: {
      type: Array<GroupData>,
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
  emits: ['select-option', 'cancel'],
  data() {
    return {
      searchQuery: '',
      openedGroups: [] as string[]
    }
  },
  computed: {
    filteredData() {
      if (!this.searchQuery) {
        return this.data
      }
      const query = this.searchQuery.toLowerCase()
      return this.data
        .map((group) => {
          const filteredList = group.list.filter((option) => option.toLowerCase().includes(query))
          return { ...group, list: filteredList }
        })
        .filter((group) => group.list.length > 0)
    }
  },
  watch: {
    searchQuery: {
      immediate: true,
      handler(newQuery: string) {
        if (newQuery) {
          // Open all groups when there is a search query
          this.openedGroups = this.data.map((group) => group.category)
        } else {
          // Close all groups when the search query is empty
          this.openedGroups = []
        }
      }
    }
  },
  methods: {
    selectOption(option: string) {
      this.$emit('select-option', option)
    },
    cancel() {
      this.$emit('cancel')
    },
    isOptionSelected(name: string) {
      return this.selectedOptions.some((selected) => selected === name)
    },
    title(str: string) {
      return capitalize(str)
    },
    selectFirstOption(event: KeyboardEvent) {
      event.preventDefault()
      event.stopPropagation()
      const firstGroup = this.filteredData[0]
      if (firstGroup && firstGroup.list.length > 0) {
        this.selectOption(firstGroup.list[0])
      }
    }
  }
})
</script>
