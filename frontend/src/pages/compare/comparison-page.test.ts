import ComparisonPage from '@/pages/compare/comparison-page.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { type MemberProduction } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TeamService } from '@/services/team/team-service'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import type { TeamProductionExt } from '@/types/member/instanced'
import { createMockMemberProduction, createMockPokemon, createMockTeamProduction } from '@/vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

vi.mock('@/services/production/production-service')

describe('ComparisonPage', () => {
  let wrapper: VueWrapper<InstanceType<typeof ComparisonPage>>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  const mockResponse: TeamProductionExt = createMockTeamProduction()
  const mockPokemon = createMockPokemon()
  const mockMemberProduction: MemberProduction = createMockMemberProduction()

  beforeEach(async () => {
    setActivePinia(createPinia())
    pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)

    TeamService.calculateProduction = vi.fn().mockResolvedValue(mockResponse)
    wrapper = mount(ComparisonPage)
    wrapper.setData({
      showDialog: false,
      tab: 'overview',
      tabs: [
        { value: 'overview', label: 'Overview' },
        { value: 'strength', label: 'Strength' },
        { value: 'misc', label: 'Misc' }
      ],
      loading: false
    })
    await nextTick()
  })

  it('renders correctly with initial data', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)
    await nextTick()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findAllComponents({ name: 'CompareSlot' })).toHaveLength(1)
  })

  it('opens dialog when add new pokemon card is clicked', async () => {
    wrapper.setData({ pokemonToCompare: [] }) // ensures first card is empty
    await nextTick()

    const addCard = wrapper.find('.compare-slot .v-card')
    expect(addCard.exists()).toBe(true)

    await addCard.trigger('click')
    expect(wrapper.vm.showDialog).toBe(true)
  })

  it('adds a new pokemon to compare members', async () => {
    const compStore = useComparisonStore()
    compStore.addMember(mockMemberProduction)

    const newPokemon = createMockPokemon({ name: 'Misty' })
    await wrapper.vm.addToCompareMembers(newPokemon)

    expect(compStore.members).toHaveLength(2)
    expect(compStore.members[1].externalId).toBe(newPokemon.externalId)
  })

  it('edits an existing pokemon in compare members', async () => {
    const compStore = useComparisonStore()

    compStore.addMember(mockMemberProduction)

    const editedPokemon = createMockPokemon({ name: 'Brock' })
    await wrapper.vm.editCompareMember(editedPokemon)

    expect(pokemonStore.getPokemon(compStore.members[0].externalId)?.name).toBe('Brock')
  })

  it('duplicates a pokemon in compare members', () => {
    const compStore = useComparisonStore()
    compStore.addMember(mockMemberProduction)

    wrapper.vm.duplicateCompareMember(mockPokemon)

    expect(compStore.members).toHaveLength(2)
    expect(pokemonStore.getPokemon(compStore.members[1].externalId)).not.toBe('Ash')
  })

  it('renders the correct tab content when tabs are clicked', async () => {
    const tabs = wrapper.findAll('.v-tab')
    await tabs[1].trigger('click')
    expect(wrapper.vm.tab).toBe('strength')
    await tabs[2].trigger('click')
    expect(wrapper.vm.tab).toBe('misc')
    await tabs[0].trigger('click')
    expect(wrapper.vm.tab).toBe('overview')
  })
})
