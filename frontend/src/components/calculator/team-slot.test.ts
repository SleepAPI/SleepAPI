import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { createMockPokemon } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { subskill } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import TeamSlot from './team-slot.vue'

describe('TeamSlot', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamSlot>>
  let teamStore: ReturnType<typeof useTeamStore>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    teamStore = useTeamStore()
    pokemonStore = usePokemonStore()

    const mockPokemon = createMockPokemon({ level: 50 })
    teamStore.teams = createMockTeams(1, { members: [mockPokemon.externalId] })
    pokemonStore.upsertLocalPokemon(mockPokemon)
    wrapper = mount(TeamSlot, {
      props: { memberIndex: 0 }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders mobile layout when isMobile is true', async () => {
    wrapper = mount(TeamSlot, {
      props: { memberIndex: 0 },
      global: {
        mocks: {
          isMobile: true
        }
      }
    })

    const mobileLayout = wrapper.find('#mobile-layout')
    expect(mobileLayout.exists()).toBe(true)
  })

  it('renders desktop layout when isMobile is false', async () => {
    wrapper = mount(TeamSlot, {
      props: { memberIndex: 0 },
      global: {
        mocks: {
          isMobile: false
        }
      }
    })
    const desktopLayout = wrapper.find('#desktop-layout')
    expect(desktopLayout.exists()).toBe(true)
  })

  it('opens details dialog when card is clicked', async () => {
    const card = wrapper.find('.v-card')
    await card.trigger('click')
    expect(wrapper.vm.showTeamSlotDialog).toBe(true)
  })

  it('displays level card correctly', async () => {
    wrapper = mount(TeamSlot, {
      props: { memberIndex: 0 },
      global: {
        mocks: {
          isMobile: true
        }
      }
    })

    const levelCard = wrapper.find('.level-card')
    expect(levelCard.exists()).toBe(true)
    expect(levelCard.text()).toContain('Level 50')
  })

  it('displays speech bubble for leader on desktop layout', async () => {
    wrapper = mount(TeamSlot, {
      props: { memberIndex: 0 },
      global: {
        mocks: {
          isMobile: false
        }
      }
    })
    const speechBubble = wrapper.findComponent({ name: 'SpeechBubble' })
    expect(speechBubble.exists()).toBe(true)
  })

  it('does not display speech bubble when not a leader', async () => {
    const mockPokemon = createMockPokemon({ level: 50 })
    teamStore.teams = createMockTeams(1, {
      members: [mockPokemon.externalId, 'Member that is not leader']
    })
    wrapper = mount(TeamSlot, {
      props: { memberIndex: 1 },
      global: {
        mocks: {
          isMobile: false
        }
      }
    })
    const speechBubble = wrapper.findComponent({ name: 'SpeechBubble' })
    expect(speechBubble.exists()).toBe(false)
  })

  it('displays correct subskill badges', () => {
    const mockPokemon = createMockPokemon({
      level: 50,
      subskills: [
        { level: 10, subskill: subskill.HELPING_BONUS },
        { level: 25, subskill: subskill.ENERGY_RECOVERY_BONUS }
      ]
    })
    teamStore.teams = createMockTeams(1, {
      members: [mockPokemon.externalId]
    })
    pokemonStore.upsertLocalPokemon(mockPokemon)

    wrapper = mount(TeamSlot, {
      props: { memberIndex: 0 },
      global: {
        mocks: {
          isMobile: true
        }
      }
    })

    const subskillBadge = wrapper.find('.responsive-text.rounded-t-0')
    expect(subskillBadge.exists()).toBe(true)
    expect(subskillBadge.text()).toContain('HB + ERB')
  })
})
