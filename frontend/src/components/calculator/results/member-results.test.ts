import TeamResults from '@/components/calculator/results/member-results.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { TeamInstance } from '@/types/member/instanced'
import { createMockMemberProduction, createMockPokemon, createMockTeamProduction } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { type PokemonInstanceExt } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('TeamResults', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamResults>>
  const mockPokemon: PokemonInstanceExt = createMockPokemon()

  const team: TeamInstance = createMockTeams()[0]

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

  it('displays "No production" when there is no member production', () => {
    const teamStore = useTeamStore()
    teamStore.currentIndex = 0
    teamStore.teams[0] = {
      members: []
    } as any

    expect(wrapper.vm.members).toBeDefined()
    expect(wrapper.vm.members!.length).toBe(0)
  })

  it('displays member production when data is available', () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    pokemonStore.upsertLocalPokemon(mockPokemon)

    teamStore.currentIndex = 0

    teamStore.teams[0] = team

    const members = wrapper.vm.members
    expect(members).toBeDefined()
    expect(members!.length).toBe(1)
    expect(members![0].member).toEqual({ ...mockPokemon, rp: undefined })
    expect(members![0].berries?.amount).toBe(10)
  })

  it('changes window item correctly', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    pokemonStore.upsertLocalPokemon(mockPokemon)
    pokemonStore.upsertLocalPokemon({ ...mockPokemon, externalId: 'mon2' })

    teamStore.currentIndex = 0
    teamStore.teams[0] = {
      ...team,
      production: createMockTeamProduction({
        members: [
          createMockMemberProduction({ member: mockPokemon }),
          createMockMemberProduction({ member: { ...mockPokemon, externalId: 'mon2' } })
        ]
      })
    }

    await nextTick()
    expect(teamStore.getCurrentTeam.memberIndex).toBe(0)

    const nextButton = wrapper.find('.v-window__right')
    await nextButton.trigger('click')

    expect(teamStore.getCurrentTeam.memberIndex).toBe(1)

    const previousButton = wrapper.find('.v-window__left')
    await previousButton.trigger('click')
    expect(teamStore.getCurrentTeam.memberIndex).toBe(0)
  })

  it('renders window item contents correctly', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    pokemonStore.upsertLocalPokemon(mockPokemon)

    teamStore.currentIndex = 0
    teamStore.teams[0] = team

    await nextTick()

    const radarChartCanvas = wrapper.find('canvas')
    expect(radarChartCanvas.exists()).toBe(true)

    const pokemonImage = wrapper.find('.v-window-item img')
    expect(pokemonImage.exists()).toBe(true)
    expect(pokemonImage.attributes('src')).toBe('/images/avatar/happy/pikachu_happy.png')

    const berryCard = wrapper.find('.text-berry')
    expect(berryCard.exists()).toBe(true)
    const ingredientCard = wrapper.find('.text-ingredient')
    expect(ingredientCard.exists()).toBe(true)
    const skillCard = wrapper.find('.text-skill')
    expect(skillCard.exists()).toBe(true)
  })

  it('renders window item images correctly', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    pokemonStore.upsertLocalPokemon(mockPokemon)

    teamStore.currentIndex = 0
    teamStore.teams[0] = team

    await nextTick()

    const windowItemImage = wrapper.find('.v-window-item img')
    expect(windowItemImage.attributes('src')).toBe('/images/avatar/happy/pikachu_happy.png')
  })
})
