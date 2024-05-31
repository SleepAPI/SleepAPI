<template>
  <v-container style="height: 55dvh">
    <v-row class="flex-top">
      <v-col cols="12">
        <v-card>
          <v-text-field
            v-model="searchQuery"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
          <div class="scrollable-list">
            <v-list v-model:opened="openedGroups" density="compact">
              <v-list-group
                v-for="group in filteredData"
                :key="group.category"
                :value="group.category"
              >
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
          </div>
        </v-card>
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
  emits: ['select-option'],
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
    isOptionSelected(name: string) {
      return this.selectedOptions.some((selected) => selected === name)
    },
    title(str: string) {
      return capitalize(str)
    }
  }
})
</script>

<style>
.scrollable-list {
  max-height: 50dvh;
  overflow-y: auto;
}
</style>
