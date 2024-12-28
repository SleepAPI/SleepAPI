import TeamSection from '@/components/calculator/team-section.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { createMockPokemon } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

describe('Team section', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamSection>>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(createMockPokemon())
    wrapper = mount(TeamSection)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('disables navigation buttons when user is not logged in', async () => {
    const leftButton = wrapper.find('button[aria-label="previous team"]')
    const rightButton = wrapper.find('button[aria-label="next team"]')

    expect(leftButton.classes()).toContain('v-btn--disabled')
    expect(rightButton.classes()).toContain('v-btn--disabled')
  })

  it('navigates teams on button clicks', async () => {
    const userStore = useUserStore()
    userStore.setTokens({ accessToken: '', expiryDate: 0, refreshToken: '' })
    const teamStore = useTeamStore()
    teamStore.currentIndex = 0
    teamStore.teams = createMockTeams(2)
    await nextTick()

    const rightButton = wrapper.find('button[aria-label="next team"]')
    await rightButton.trigger('click')
    expect(teamStore.currentIndex).toBe(1)

    const leftButton = wrapper.find('button[aria-label="previous team"]')
    await leftButton.trigger('click')
    expect(teamStore.currentIndex).toBe(0)
  })

  it('displays skeleton loader when there is no production', async () => {
    const teamStore = useTeamStore()
    teamStore.getCurrentTeam.members.push('some member')

    await nextTick()

    const skeletonLoader = wrapper.findComponent({ name: 'VSkeletonLoader' })
    expect(skeletonLoader.exists()).toBe(true)
  })

  it('switches between tabs correctly', async () => {
    const teamStore = useTeamStore()
    const mockPokemon = createMockPokemon()
    // need team size 2 because otherwise tabs are not shown, we dont show tabs for team with 1 member
    teamStore.teams = createMockTeams(1, {
      members: [mockPokemon.externalId, mockPokemon.externalId]
    })
    await nextTick()

    const tabs = wrapper.findAllComponents({ name: 'VTab' })
    expect(tabs).toHaveLength(3)
    const overviewTab = tabs.at(0)
    const membersTab = tabs.at(1)
    const cookingTab = tabs.at(2)

    await overviewTab?.trigger('click')
    expect(teamStore.tab).toBe('overview')

    await membersTab?.trigger('click')
    expect(teamStore.tab).toBe('members')

    await cookingTab?.trigger('click')
    expect(teamStore.tab).toBe('cooking')
  })

  it('calculates production when missing', async () => {
    const teamStore = useTeamStore()
    teamStore.syncTeams = vi.fn()
    teamStore.calculateProduction = vi.fn()

    wrapper = mount(TeamSection)
    await nextTick()

    expect(teamStore.syncTeams).toHaveBeenCalled()
    expect(teamStore.calculateProduction).toHaveBeenCalled()
  })

  it('renders desktop-specific layout when not on mobile', async () => {
    wrapper = mount(TeamSection, {
      global: {
        mocks: {
          isMobile: false
        }
      }
    })

    const desktopLayout = wrapper.find('#desktop-layout')
    const mobileLayout = wrapper.find('#mobile-layout')
    expect(desktopLayout.exists()).toBe(true)
    expect(mobileLayout.exists()).toBe(false)
  })

  it('shows team settings and navigation on desktop', async () => {
    wrapper = mount(TeamSection, {
      global: {
        mocks: {
          isMobile: false
        }
      }
    })

    const teamSettings = wrapper.findComponent({ name: 'TeamSettings' })
    expect(teamSettings.exists()).toBe(true)

    const leftButton = wrapper.find('button[aria-label="previous team"]')
    const rightButton = wrapper.find('button[aria-label="next team"]')

    expect(leftButton.exists()).toBe(true)
    expect(rightButton.exists()).toBe(true)
  })
})
