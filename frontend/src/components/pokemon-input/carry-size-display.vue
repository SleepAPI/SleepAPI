<template>
  <div class="carry-size-display">Carry size {{ calculatedCarrySize }}</div>
</template>

<script lang="ts">
import {
  calculateRibbonCarrySize,
  calculateSubskillCarrySize,
  CarrySizeUtils,
  limitSubSkillsToLevel,
  type PokemonInstance
} from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'CarrySizeDisplay',
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstance>,
      required: true
    }
  },
  computed: {
    activeSubskills() {
      const subskills = new Set(this.pokemonInstance.subskills.map((s) => s.subskill.name))

      return limitSubSkillsToLevel(subskills, this.pokemonInstance.level)
    },
    calculatedCarrySize() {
      return CarrySizeUtils.calculateCarrySize({
        baseWithEvolutions: this.pokemonInstance.carrySize,
        subskillsLevelLimited: this.activeSubskills,
        ribbon: this.pokemonInstance.ribbon,
        camp: false
      })
    },
    carryGainFromSubskills() {
      return calculateSubskillCarrySize(this.activeSubskills)
    },
    carryGainFromRibbon() {
      return calculateRibbonCarrySize(this.pokemonInstance.ribbon)
    }
  }
}
</script>

<style lang="scss" scoped>
.carry-size-display {
  letter-spacing: 0.04em;
  white-space: nowrap;
}
</style>
