import TeamResults from '@/components/calculator/results/member-results.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { TeamInstance } from '@/types/member/instanced'
import {
  createMockMemberProduction,
  createMockMemberSingleProduction,
  createMockPokemon,
  createMockTeamProduction
} from '@/vitest'
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

    const nextButton = wrapper.find('#nextMember')
    await nextButton.trigger('click')

    expect(teamStore.getCurrentTeam.memberIndex).toBe(1)

    const previousButton = wrapper.find('#prevMember')
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

    const radarChartData = wrapper.vm.radarData.datasets[0].data
    expect(radarChartData).toEqual([50, 50, 50])

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

  it('should update chart on new single production', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    pokemonStore.upsertLocalPokemon(mockPokemon)

    teamStore.currentIndex = 0
    teamStore.teams[0] = team

    await nextTick()

    const radarChartCanvas = wrapper.find('canvas')
    expect(radarChartCanvas.exists()).toBe(true)

    let radarChartData = wrapper.vm.radarData.datasets[0].data
    expect(radarChartData).toEqual([50, 50, 50])

    const defaultPerformance = { berry: 0, ingredient: 0, ingredientsOfTotal: [0], skill: 0 }
    teamStore.teams[0]!.production!.members[0]!.singleProduction = createMockMemberSingleProduction(
      {
        performanceAnalysis: {
          neutral: defaultPerformance,
          optimal: defaultPerformance,
          user: { berry: 60, ingredient: 60, ingredientsOfTotal: [60], skill: 60 }
        }
      }
    )
    await nextTick()

    radarChartData = wrapper.vm.radarData.datasets[0].data
    expect(radarChartData).toEqual([60, 60, 60])
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
