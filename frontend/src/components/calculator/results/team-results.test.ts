import TeamResults from '@/components/calculator/results/team-results.vue'
import { useTeamStore } from '@/stores/team/team-store'
import { createMockMemberProduction, createMockTeamProduction } from '@/vitest'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { berry } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('TeamResults', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamResults>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(TeamResults)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', async () => {
    const teamStore = useTeamStore()

    teamStore.getCurrentTeam.production = {
      team: {
        cooking: {
          curry: {
            weeklyStrength: 1000,
            sundayStrength: 100,
            cookedRecipes: []
          },
          salad: { weeklyStrength: 0, sundayStrength: 0, cookedRecipes: [] },
          dessert: { weeklyStrength: 0, sundayStrength: 0, cookedRecipes: [] }
        },
        berries: [],
        ingredients: []
      },
      members: []
    }
    await nextTick()

    const strengthSpan = wrapper.find('#weeklyStrength')
    expect(strengthSpan.text()).toBe('1,600')
    const totalStrength = wrapper.vm.totalStrengthString
    expect(totalStrength).toBe('1,600')
  })

  it('renders the stacked bar with correct percentages', async () => {
    const teamStore = useTeamStore()

    teamStore.getCurrentTeam.production = {
      team: {
        cooking: {
          curry: {
            weeklyStrength: 10000,
            sundayStrength: 0,
            cookedRecipes: []
          },
          salad: { weeklyStrength: 0, sundayStrength: 0, cookedRecipes: [] },
          dessert: { weeklyStrength: 0, sundayStrength: 0, cookedRecipes: [] }
        },
        berries: [],
        ingredients: []
      },
      members: [
        createMockMemberProduction({ berries: { amount: 10, berry: berry.BELUE }, skillProcs: 1 })
      ]
    }
    await nextTick()

    const stackedBar = wrapper.findComponent({ name: 'StackedBar' })
    expect(stackedBar.exists()).toBe(true)

    expect(stackedBar.props('sections')).toEqual([
      { color: 'curry', percentage: 63.5 },
      { color: 'berry', percentage: 18.6 },
      { color: 'skill', percentage: 17.7 }
    ])
  })

  it('renders member progress bars correctly', async () => {
    const teamStore = useTeamStore()

    teamStore.getCurrentTeam.production = createMockTeamProduction()
    await nextTick()

    const progressBars = wrapper.findAll('#memberBar')
    expect(progressBars.length).toBe(1)

    const memberProgress = progressBars.at(0)

    const berryPercentage = memberProgress?.attributes('aria-valuenow')
    expect(Number(berryPercentage)).toBeCloseTo(17.4)

    const totalStrength = memberProgress?.find('.text-body-1').text()
    expect(totalStrength).toBe('27,104')
  })
})
