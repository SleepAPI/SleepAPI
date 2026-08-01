<template>
  <v-row class="px-2">
    <!-- Skill distribution -->
    <v-col class="flex-left">
      <v-dialog v-model="showSkillDistribution" :close-on-content-click="false" max-width="500">
        <template #activator="{ props }">
          <v-btn v-bind="props" append-icon="mdi-chart-bar"> Skill distribution </v-btn>
        </template>

        <v-card class="pa-2" id="chartDialog">
          <div class="text-body-2 font-weight-light pb-6">
            <span class="font-weight-medium">{{ pokemonProduction.member.name }}</span> averages
            <span class="text-strength font-weight-medium">{{ averageSkillProcsPerDay }}</span> skill procs per day.
            Most often, <span class="font-weight-medium">{{ pokemonProduction.member.name }}</span> gets
            <span class="text-primary font-weight-medium">{{ mostCommonProcsPerDay.procs }}</span> procs, occurring
            <span class="text-primary font-weight-medium">{{ mostCommonProcsPerDay.percentage }}%</span> of the time.
          </div>

          <BarChart class="mb-3" :chartData="chartData" :chartOptions="chartOptions" :chart-plugins="chartPlugins" />

          <v-btn color="secondary" @click="showSkillDistribution = false"> Close </v-btn>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import {
  averageSkillProcsPlugin,
  getSkillProcChartData,
  getSkillProcChartOptions
} from '@/components/calculator/results/member-results/skill-breakdown/skill-proc-distribution-data'
import BarChart from '@/components/custom-components/charts/bar-chart/bar-chart.vue'
import type { MemberWithProduction } from '@/types/member/instanced'
import { MathUtils } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'
import { useTheme } from 'vuetify'

export default defineComponent({
  name: 'SkillDistribution',
  components: {
    BarChart
  },
  props: {
    pokemonProduction: {
      type: Object as PropType<MemberWithProduction>,
      required: true
    }
  },
  data: () => ({
    showSkillDistribution: false
  }),
  computed: {
    averageSkillProcsPerDay(): number {
      return MathUtils.round(this.pokemonProduction.production.skillProcs, 1)
    },
    mostCommonProcsPerDay(): { procs: number; percentage: number } {
      const skillDistributions = this.pokemonProduction.production.advanced?.skillProcDistribution ?? {}
      const mostCommonProcs = Object.entries(skillDistributions).reduce((a, b) => (b[1] > a[1] ? b : a))
      return { procs: MathUtils.round(+mostCommonProcs[0], 1), percentage: MathUtils.round(+mostCommonProcs[1], 1) }
    },
    themeColors() {
      const theme = useTheme()
      return theme.current.value.colors
    },
    skillColor(): string {
      return this.themeColors['skill']
    },
    strengthColor(): string {
      return this.themeColors['strength']
    },
    skillDistributions(): Record<number, number> {
      return this.pokemonProduction.production.advanced?.skillProcDistribution ?? {}
    },
    chartOptions() {
      return getSkillProcChartOptions()
    },
    chartPlugins(): any[] {
      return [averageSkillProcsPlugin(this.averageSkillProcsPerDay, this.strengthColor)]
    },
    chartData(): any {
      return getSkillProcChartData(this.skillDistributions, this.skillColor)
    }
  }
})
</script>
