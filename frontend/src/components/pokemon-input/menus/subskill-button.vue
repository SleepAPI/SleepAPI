<template>
  <v-badge
    class="w-100"
    location="top right"
    :offset-y="2"
    :offset-x="8"
    color="primary"
    rounded="lg"
    :content="level"
    :model-value="level !== undefined"
  >
    <v-btn
      :color="rarityColor"
      class="w-100 button-height"
      rounded="lg"
      size="xx-small"
      style="font-size: x-small"
      stacked
    >
      {{ subskillLabel }}
    </v-btn>
  </v-badge>
</template>

<script lang="ts">
import { capitalize, subskill, type SubskillInstanceExt } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'SubskillButton',
  props: {
    subskill: {
      type: Object as PropType<subskill.SubSkill>,
      required: true
    },
    label: {
      type: String,
      required: false,
      default: undefined
    },
    selectedSubskills: {
      type: Array<SubskillInstanceExt>,
      required: true,
      default: () => []
    }
  },
  computed: {
    rarityColor() {
      return `subskill${capitalize(this.subskill.rarity)}`
    },
    subskillLabel() {
      return this.label ?? this.subskill.name
    },
    level() {
      return this.selectedSubskills.find(
        (ssExt) => ssExt.subskill.name.toLowerCase() === this.subskill.name.toLowerCase()
      )?.level
    }
  }
}
</script>

<style lang="scss">
.button-height {
  height: 36px !important;
}
</style>
