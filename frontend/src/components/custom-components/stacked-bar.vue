<template>
  <v-row class="stacked-bar" no-gutters>
    <div
      v-for="(section, index) in sections"
      :key="index"
      class="flex-center"
      :class="`bg-${section.color}`"
      :style="{
        width: section.percentage + '%',
        borderTopLeftRadius: index === 0 ? '10px' : '0',
        borderBottomLeftRadius: index === 0 ? '10px' : '0',
        borderTopRightRadius: index === sections.length - 1 ? '10px' : '0',
        borderBottomRightRadius: index === sections.length - 1 ? '10px' : '0'
      }"
    >
      <v-tooltip v-model="activeTooltips[index]" theme="light" bottom :close-on-content-click="false">
        <template #activator="{ props }">
          <div v-bind="props" class="flex-center" style="width: 100%; height: 100%" @click="toggleTooltip(index)">
            <span
              v-if="section.percentage > minDisplayPercentage"
              :style="{ zIndex: sections.length - index }"
              class="font-weight-regular text-black responsive-text"
            >
              {{ section.sectionText }}
            </span>
          </div>
        </template>
        <span>{{ section.tooltipText }}</span>
      </v-tooltip>
    </div>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export interface Section {
  percentage: number
  sectionText: string
  tooltipText: string
  color: string
}

export default defineComponent({
  name: 'StackedBar',
  props: {
    sections: {
      type: Array<Section>,
      required: true
    }
  },
  data() {
    return {
      minDisplayPercentage: 10,
      activeTooltips: this.sections.map(() => false)
    }
  },
  methods: {
    toggleTooltip(index: number) {
      this.activeTooltips[index] = !this.activeTooltips[index]
    },
    round(num: number) {
      return Math.round(num)
    }
  }
})
</script>

<style lang="scss">
@import '@/assets/main.scss';

.stacked-bar {
  height: 40px;
  background-color: $secondary;
  border-radius: 10px;
  overflow: hidden;
}
</style>
