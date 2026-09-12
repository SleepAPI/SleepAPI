import SkillDistribution from '@/components/calculator/results/member-results/member-stats/skill-distribution.vue'
import { registerChartJS } from '@/components/custom-components/charts/register-charts'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('SkillDistribution.vue', () => {
  registerChartJS()
  let wrapper: VueWrapper<InstanceType<typeof SkillDistribution>>

  const pokemonProduction = mocks.createMockMemberWithProduction({
    member: mocks.createMockPokemon({ name: 'Test member' }),
    production: mocks.createMockMemberProduction({
      skillProcs: 5.5,
      advanced: {
        ...mocks.createMockMemberProduction().advanced,
        skillProcDistribution: {
          '1': 0.1,
          '2': 0.2,
          '3': 0.4,
          '4': 0.2,
          '5': 0.1
        }
      }
    })
  })

  beforeEach(() => {
    wrapper = mount(SkillDistribution, {
      props: { pokemonProduction }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders the button correctly', () => {
    expect(wrapper.exists()).toBe(true)

    expect(wrapper.text()).toContain('Skill distribution')
  })

  it('clicking button should open chart', async () => {
    await wrapper.find('button').trigger('click')

    const chartDialog = document.querySelector('#chartDialog')
    expect(chartDialog).not.toBeNull()

    expect(chartDialog?.textContent).toContain('Test member averages 5.5 skill procs per day.')
    expect(chartDialog?.textContent).toContain('Most often, Test member gets 3 procs, occurring 0.4% of the time.')

    const barChart = wrapper.findComponent({ name: 'BarChart' })
    expect(barChart.exists()).toBe(true)
  })
})
