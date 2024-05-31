<template>
  <v-menu v-model="menu" :close-on-content-click="false" offset-y>
    <template #activator="{ props }">
      <v-btn class="w-100" v-bind="props" :disabled="disabled">
        <span class="text-body-1"> Level {{ level }} </span>
      </v-btn>
    </template>

    <v-card>
      <v-list density="compact">
        <v-list-item v-for="value in defaultValues" :key="value" @click="selectValue(value)">
          <v-list-item-title>{{ value }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-text-field
        v-model.number="customValue"
        label="Custom Level"
        type="number"
        hide-details
        @keydown.enter="selectCustomValue"
      ></v-text-field>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="menu = !menu">Cancel</v-btn>
        <v-btn color="primary" @click="selectCustomValue">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
export default {
  name: 'LevelButton',
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update-level'],
  data: () => ({
    level: 50,
    menu: false,
    customValue: 50,
    defaultValues: [10, 25, 30, 50, 60]
  }),
  watch: {
    level(newValue) {
      this.customValue = newValue
    }
  },
  methods: {
    selectValue(value: number) {
      this.updateLevel(value)
      this.menu = false
    },
    selectCustomValue() {
      if (this.customValue >= 1 && this.customValue <= 100) {
        this.updateLevel(this.customValue)
        this.menu = false
      }
    },
    updateLevel(newLevel: number) {
      this.level = newLevel
      this.$emit('update-level', newLevel)
    }
  }
}
</script>
