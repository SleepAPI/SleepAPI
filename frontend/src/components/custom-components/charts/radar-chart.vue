<template>
  <Radar :options="chartOptions" :data="chartData" />
</template>

<script lang="ts">
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
  type ChartData
} from 'chart.js'
import { Radar } from 'vue-chartjs'

ChartJS.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

export default {
  name: 'RadarChart',
  components: {
    Radar
  },
  props: {
    chartData: {
      type: Object as () => ChartData<'radar'>,
      required: true
    },
    chartOptions: {
      type: Object,
      required: true
    }
  }
}
</script>
