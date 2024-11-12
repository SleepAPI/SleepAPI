import MemberResults from '@/components/calculator/results/member-results/member-results.vue'
import { TeamService } from '@/services/team/team-service'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { createMockMemberProduction, createMockPokemon, createMockTeamProduction } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

describe('MemberResults', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberResults>>
  let teamStore: ReturnType<typeof useTeamStore>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  const mockPokemon = createMockPokemon()

  beforeEach(() => {
    setActivePinia(createPinia())
    teamStore = useTeamStore()
    pokemonStore = usePokemonStore()

    pokemonStore.upsertLocalPokemon(createMockPokemon())
    teamStore.teams = createMockTeams()

    wrapper = mount(MemberResults)
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
    teamStore.teams[0].members = []

    expect(wrapper.vm.membersWithProduction).toBeDefined()
    expect(wrapper.vm.membersWithProduction!.length).toBe(0)
  })

  it('displays member production when data is available', () => {
    const members = wrapper.vm.membersWithProduction
    expect(members).toBeDefined()
    expect(members!.length).toBe(1)
    expect(members![0].production.externalId).toEqual(mockPokemon.externalId)
    expect(members![0].production.produceTotal.berries[0].amount).toBe(10)
  })

  it('changes window item correctly', async () => {
    TeamService.calculateCurrentMemberIv = vi.fn().mockResolvedValue({
      optimalBerry: createMockMemberProduction(),
      optimalIngredient: createMockMemberProduction(),
      optimalSkill: createMockMemberProduction()
    })

    pokemonStore.upsertLocalPokemon({ ...mockPokemon, externalId: 'mon1' })
    pokemonStore.upsertLocalPokemon({ ...mockPokemon, externalId: 'mon2' })
    teamStore.teams = createMockTeams(1, {
      members: ['mon1', 'mon2'],
      production: createMockTeamProduction({
        members: [
          createMockMemberProduction({ externalId: 'mon1' }),
          createMockMemberProduction({ externalId: 'mon2' })
        ]
      })
    })

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
    const radarChartCanvas = wrapper.find('canvas')
    expect(radarChartCanvas.exists()).toBe(true)

    const radarChartData = wrapper.vm.ivData.datasets[0].data
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

  it('should update chart on new iv numbers', async () => {
    const radarChartCanvas = wrapper.find('canvas')
    expect(radarChartCanvas.exists()).toBe(true)

    let radarChartData = wrapper.vm.ivData.datasets[0].data
    expect(radarChartData).toEqual([50, 50, 50])

    const defaultPerformance = {
      berry: 0,
      ingredient: 0,
      ingredientsOfTotal: [0],
      skill: 0,
      externalId: 'mon1'
    }
    teamStore.teams[0]!.memberIvs[mockPokemon.externalId] = defaultPerformance
    await nextTick()

    radarChartData = wrapper.vm.ivData.datasets[0].data
    expect(radarChartData).toEqual([0, 0, 0])
  })

  it('renders window item images correctly', async () => {
    const windowItemImage = wrapper.find('.v-window-item img')
    expect(windowItemImage.attributes('src')).toBe('/images/avatar/happy/pikachu_happy.png')
  })
})
