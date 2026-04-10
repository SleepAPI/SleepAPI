<template>
  <v-row class="stacked-bar" no-gutters>
    <div
      v-for="(section, index) in sections"
      :key="index"
      :class="[`bg-${section.color}`]"
      :style="{
        height: '100%',
        width: calculateWidth(section.percentage, index) + '%',
        borderTopLeftRadius: index === 0 ? '10px' : '0',
        borderBottomLeftRadius: index === 0 ? '10px' : '0',
        borderTopRightRadius: isLastSection(index) ? '10px' : '0',
        borderBottomRightRadius: isLastSection(index) ? '10px' : '0'
      }"
    >
      <v-tooltip v-model="activeTooltips[index]" theme="light" bottom :close-on-content-click="false">
        <template #activator="{ props }">
          <div v-bind="props" class="flex-center" style="width: 100%; height: 100%" @click="toggleTooltip(index)">
            <span
              v-if="section.percentage > minDisplayPercentage"
              :style="{ zIndex: sections.length - index }"
              class="font-weight-regular text-black text-x-small"
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
import { defineComponent } from 'vue';

export interface Section {
  percentage: number;
  sectionText: string;
  tooltipText: string;
  color: string;
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
    };
  },
  methods: {
    toggleTooltip(index: number) {
      this.activeTooltips[index] = !this.activeTooltips[index];
    },
    calculateWidth(percentage: number, index: number): number {
      const remainingPercentage = this.sections.slice(0, index).reduce((sum, section) => sum - section.percentage, 100);
      return Math.max(0, Math.min(percentage, remainingPercentage));
    },
    isLastSection(index: number): boolean {
      return index === this.sections.length - 1;
    }
  }
});
</script>

<style lang="scss">
.stacked-bar {
  height: 40px;
  background-color: --color-secondary-500;
  border-radius: 10px;
  overflow: hidden;
}
</style>
