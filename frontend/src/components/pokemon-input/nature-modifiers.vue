<template>
  <div>
    <div class="nowrap responsive-text">
      <span class="nowrap mr-1">{{ getModifiedStat('positive') }}</span>
      <v-icon color="primary" class="responsive-icon">mdi-triangle</v-icon>
      <v-icon color="primary" class="responsive-icon">mdi-triangle</v-icon>
    </div>
    <div class="nowrap responsive-text">
      <span class="nowrap mr-1">{{ getModifiedStat('negative') }}</span>
      <v-icon color="surface" class="responsive-icon">mdi-triangle-down</v-icon>
      <v-icon color="surface" class="responsive-icon">mdi-triangle-down</v-icon>
    </div>
  </div>
</template>

<script lang="ts">
import type { nature } from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'NatureModifiers',
  props: {
    nature: {
      type: Object as PropType<nature.Nature>,
      required: true
    },
    short: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getModifiedStat(modifier: 'positive' | 'negative') {
      const modifiers: { [key: string]: { value: number; message: string } } = {
        frequency: {
          value: this.nature.frequency,
          message: this.short ? 'Speed' : 'Speed of help'
        },
        ingredient: {
          value: this.nature.ingredient,
          message: this.short ? 'Ing' : 'Ingredient finding'
        },
        skill: { value: this.nature.skill, message: this.short ? 'Skill' : 'Main skill chance' },
        energy: { value: this.nature.energy, message: this.short ? 'Energy' : 'Energy recovery' },
        exp: { value: this.nature.exp, message: 'EXP' }
      }

      for (const key in modifiers) {
        if (modifiers[key].value > 1 && modifier === 'positive') {
          return modifiers[key].message
        } else if (modifiers[key].value < 1 && modifier === 'negative') {
          return modifiers[key].message
        }
      }

      return 'This nature has no effect'
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/main.scss';
</style>
