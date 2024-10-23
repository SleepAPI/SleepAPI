import { Chart, RadialLinearScale, type ChartData, type Plugin } from 'chart.js'
import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'

export const ivData: Ref<ChartData<'radar'>> = ref<ChartData<'radar'>>({
  labels: ['Skill', 'Ingredient', 'Berry'],
  datasets: [
    {
      data: [0, 0, 0],
      borderColor: '#767d98',
      backgroundColor: '#5f6782AA',
      pointBorderColor: ['#ff616e', '#fbe346', '#b297e7'], // Will get updated with theme colors
      pointBackgroundColor: ['#ff616e', '#fbe346', '#b297e7'] // Will get updated with theme colors
    }
  ]
})

export const ivTextPlugin: Plugin<'radar'> = {
  id: 'customPlugin',
  afterDraw(chart: Chart) {
    const ctx = chart.ctx
    const scale = chart.scales.r as RadialLinearScale
    const data = chart.config.data.datasets[0].data as number[]
    const labels = chart.config.data.labels as string[]

    if (!chart) return

    ctx.save()
    ctx.textAlign = 'center'

    // Iterate over each label and data value to draw the percentage and label
    labels.forEach((label, index) => {
      const position = scale.getPointPosition(index, scale.max)
      const value = `${data[index]}%`

      ctx.font = 'bold 18px Chakra Petch'
      if (index === 0) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
          '--v-theme-skill'
        )
        ctx.fillText(value, position.x, position.y + 33)
        ctx.font = '10px Chakra Petch'
        ctx.fillText(label.toLowerCase(), position.x, position.y + 40)
      } else if (index === 1) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
          '--v-theme-ingredient'
        )
        ctx.fillText(value, position.x - 35, position.y - 7)
        ctx.font = '10px Chakra Petch'
        ctx.fillText(label.toLowerCase(), position.x - 35, position.y)
      } else if (index === 2) {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
          '--v-theme-berry'
        )
        ctx.fillText(value, position.x + 30, position.y - 7)
        ctx.font = '10px Chakra Petch'
        ctx.fillText(label.toLowerCase(), position.x + 30, position.y)
      }
    })

    ctx.restore()
  }
}

// Chart options
export const ivOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 10
    }
  },
  scales: {
    r: {
      min: 0,
      max: 100,
      ticks: {
        stepSize: 100,
        backdropColor: 'rgba(0, 0, 0, 0)',
        callback(value: number) {
          if (value === 100) {
            return ''
          }
          return value
        }
      },
      pointLabels: {
        display: false
      },
      grid: {
        color: '#fff',
        lineWidth: 1
      },
      angleLines: {
        color: '#fff',
        lineWidth: 1
      },
      afterFit(scale: { yCenter: number }) {
        scale.yCenter += 10
      }
    }
  },
  elements: {
    line: {
      borderWidth: 2
    }
  },
  plugins: {
    legend: {
      display: false
    },
    ivTextPlugin
  }
}

export default {
  setup() {
    onMounted(() => {
      const skillColor = getComputedStyle(document.documentElement).getPropertyValue(
        '--v-theme-skill'
      )
      const ingredientColor = getComputedStyle(document.documentElement).getPropertyValue(
        '--v-theme-ingredient'
      )
      const berryColor = getComputedStyle(document.documentElement).getPropertyValue(
        '--v-theme-berry'
      )

      ivData.value.datasets[0].pointBorderColor = [skillColor, ingredientColor, berryColor]
      ivData.value.datasets[0].pointBackgroundColor = [skillColor, ingredientColor, berryColor]
    })

    return {
      ivData,
      ivOptions
    }
  }
}
