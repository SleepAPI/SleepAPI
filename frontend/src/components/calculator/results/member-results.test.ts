import TeamResults from '@/components/calculator/results/member-results.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import type { TeamInstance } from '@/types/member/instanced'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { berry, ingredient, nature, pokemon, type PokemonInstanceExt } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('TeamResults', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamResults>>
  const externalId = 'external-id'
  const mockPokemon: PokemonInstanceExt = {
    name: 'Bubbles',
    externalId,
    pokemon: pokemon.PIKACHU,
    carrySize: 10,
    ingredients: [{ level: 1, ingredient: ingredient.FANCY_APPLE }],
    level: 10,
    ribbon: 0,
    nature: nature.BASHFUL,
    saved: false,
    shiny: false,
    skillLevel: 1,
    subskills: [],
    version: 1
  }

  const team: TeamInstance = {
    members: [externalId],
    production: {
      members: [
        {
          member: mockPokemon,
          ingredients: [{ amount: 1, ingredient: ingredient.BEAN_SAUSAGE }],
          skillProcs: 1,
          berries: { amount: 5, berry: berry.BELUE }
        }
      ],
      team: {
        berries: [{ amount: 5, berry: berry.BELUE }],
        ingredients: [{ amount: 1, ingredient: ingredient.BEAN_SAUSAGE }]
      }
    },
    index: 0,
    camp: false,
    bedtime: '21:30',
    wakeup: '06:00',
    name: 'Team name',
    version: 0
  }

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

    // TODO: or is this just undefined now?
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
    expect(members![0].member).toEqual(mockPokemon)
    expect(members![0].berries?.amount).toBe(5)
  })

  it('changes tab correctly', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    pokemonStore.upsertLocalPokemon(mockPokemon)

    teamStore.currentIndex = 0
    teamStore.teams[0] = team

    await nextTick()

    const tabs = wrapper.findAll('.v-tab')
    await tabs[0].trigger('click')
    expect(wrapper.vm.tab).toBe(0)
  })

  it('renders tab contents correctly', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    pokemonStore.upsertLocalPokemon(mockPokemon)

    teamStore.currentIndex = 0
    teamStore.teams[0] = team

    await nextTick()

    const tabs = wrapper.findAll('.v-tab')
    await tabs[0].trigger('click')
    await nextTick()

    const overviewTabContent = wrapper.find('.v-window-item.v-tabs-window-item .v-card-text')
    expect(overviewTabContent.text()).toMatchInlineSnapshot(
      `"Berries: 5 BELUEIngredients: 1 SausageSkill procs: 1 x 400 = 400 strength"`
    )
  })

  it('renders tab images correctly', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    pokemonStore.upsertLocalPokemon(mockPokemon)

    teamStore.currentIndex = 0
    teamStore.teams[0] = team

    await nextTick()

    const tabImage = wrapper.find('.v-tab img')
    expect(tabImage.attributes('src')).toBe('/images/pokemon/pikachu.png')
  })
})
