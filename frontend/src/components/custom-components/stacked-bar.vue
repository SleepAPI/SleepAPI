<template>
  <v-row class="stacked-bar" no-gutters>
    <div
      v-for="(section, index) in sections"
      :key="index"
      class="stacked-bar-section flex-center"
      :class="`bg-${section.color}`"
      :style="{ width: section.percentage + '%' }"
    >
      {{ section.percentage }}%
    </div>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'StackedBar',
  props: {
    sections: {
      type: Array<{ percentage: number; color: string }>,
      required: true
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/main.scss';

.stacked-bar {
  width: 100%;
  height: 40px;
  display: flex;
  overflow: hidden;
  border-radius: 4px;
  background-color: $secondary;
}

.stacked-bar-section {
  height: 100%;
  text-align: center;
}
</style>
