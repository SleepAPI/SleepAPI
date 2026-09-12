<template>
  <v-row class="flex-center px-2" dense>
    <v-col>
      <v-divider />
    </v-col>
    <v-col cols="auto" class="flex-center text-no-wrap text-strength text-h6"> Skill Breakdown </v-col>
    <v-col>
      <v-divider />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import BarChart from '@/components/custom-components/charts/bar-chart/bar-chart.vue'
import type { MemberWithProduction } from '@/types/member/instanced'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'SkillBreakdown',
  components: {
    BarChart
  },
  props: {
    pokemonProduction: {
      type: Object as PropType<MemberWithProduction>,
      required: true
    }
  }
})
</script>
