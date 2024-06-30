import TeamResults from '@/components/calculator/results/team-results.vue'
import { useTeamStore } from '@/stores/team/team-store'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
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

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays "No production" when there is no team production', () => {
    const teamStore = useTeamStore()
    teamStore.currentIndex = 0
    teamStore.teams[0] = {
      production: undefined
    } as any

    expect(wrapper.vm.teamProduction).toBe('No production')
  })

  it('displays team production when data is available', () => {
    const teamStore = useTeamStore()
    teamStore.currentIndex = 0
    teamStore.teams[0] = {
      production: {
        team: {
          berries: '10 Berries',
          ingredients: '5 Ingredients'
        }
      }
    } as any

    expect(wrapper.vm.teamProduction).toBe('10 Berries\n5 Ingredients')
  })

  it('changes tab correctly', async () => {
    const tabs = wrapper.findAll('.v-tab')
    await tabs[1].trigger('click')
    expect(wrapper.vm.tab).toBe('cooking')
    await tabs[2].trigger('click')
    expect(wrapper.vm.tab).toBe('analysis')
    await tabs[0].trigger('click')
    expect(wrapper.vm.tab).toBe('overview')
  })

  it('renders tab contents correctly', async () => {
    const tabs = wrapper.findAll('.v-tab')

    const teamStore = useTeamStore()

    teamStore.currentIndex = 0
    teamStore.teams[0] = {
      production: {
        team: {
          berries: '10 Berries',
          ingredients: '5 Ingredients'
        }
      }
    } as any

    await tabs[0].trigger('click')
    await nextTick()
    const overviewTabContent = wrapper.find('.v-window-item.v-tabs-window-item .v-card-text')
    expect(overviewTabContent.text()).toBe('10 Berries\n5 Ingredients')
  })
})
