import RadarChart from '@/components/custom-components/charts/radar-chart.vue'
import { VueWrapper, mount } from '@vue/test-utils'
import type { ChartData } from 'chart.js'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('RadarChart', () => {
  let wrapper: VueWrapper<InstanceType<typeof RadarChart>>

  const chartData: ChartData<'radar', (number | null)[], string> = {
    labels: ['A', 'B', 'C', 'D'],
    datasets: [
      {
        label: 'Sample Dataset',
        data: [10, 20, 30, 40],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true
      }
    }
  }

  beforeEach(() => {
    wrapper = mount(RadarChart, {
      props: {
        chartData,
        chartOptions
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('receives chartData and chartOptions props correctly', () => {
    expect(wrapper.props('chartData')).toEqual(chartData)
    expect(wrapper.props('chartOptions')).toEqual(chartOptions)
  })

  it('renders the Radar component with correct data', () => {
    const radarComponent = wrapper.findComponent({ name: 'Radar' })
    expect(radarComponent.exists()).toBe(true)
    expect(radarComponent.props('data')).toEqual(chartData)
    expect(radarComponent.props('options')).toEqual(chartOptions)
  })
})
