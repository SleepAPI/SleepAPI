<template>
  <v-row class="stacked-bar" no-gutters>
    <div
      v-for="(section, index) in sections"
      :key="index"
      class="stacked-bar-section flex-center"
      :class="`bg-${section.color}`"
      :style="{ width: section.percentage + '%' }"
    >
      <span :style="{ zIndex: sections.length - index }" class="font-weight-regular text-black">
        {{ section.percentage > 0 ? `${section.percentage}%` : '' }}
      </span>
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
  height: 40px;
  background-color: $secondary;
}
</style>
