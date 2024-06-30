import TeamResults from '@/components/calculator/results/member-results.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { pokemon } from 'sleepapi-common'
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

  it('displays "No production" when there is no member production', () => {
    const teamStore = useTeamStore()
    teamStore.currentIndex = 0
    teamStore.teams[0] = {
      members: []
    } as any

    expect(wrapper.vm.members.length).toBe(0)
  })

  it('displays member production when data is available', () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    const externalId = 'external-id'
    const mockPokemon = { name: 'Pikachu', externalId, pokemon: pokemon.PIKACHU } as any
    pokemonStore.upsertPokemon(mockPokemon)

    teamStore.currentIndex = 0
    teamStore.teams[0] = {
      members: [externalId],
      production: {
        members: [{ externalId, berries: 5 }] // TODO:
      }
    } as any

    const members = wrapper.vm.members
    expect(members.length).toBe(1)
    expect(members[0].member).toEqual(mockPokemon)
    expect(members[0].production?.berries).toBe(5)
  })

  it('changes tab correctly', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    const externalId = 'external-id'
    const mockPokemon = { name: 'Pikachu', externalId, pokemon: pokemon.PIKACHU } as any
    pokemonStore.upsertPokemon(mockPokemon)

    teamStore.currentIndex = 0
    teamStore.teams[0] = {
      members: [externalId],
      production: {
        members: [{ externalId, production: '5 Berries' }]
      }
    } as any

    await nextTick()

    const tabs = wrapper.findAll('.v-tab')
    await tabs[0].trigger('click')
    expect(wrapper.vm.tab).toBe(0)
  })

  it('renders tab contents correctly', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    const externalId = 'external-id'
    const mockPokemon = { name: 'Pikachu', externalId, pokemon: pokemon.PIKACHU } as any
    pokemonStore.upsertPokemon(mockPokemon)

    teamStore.currentIndex = 0
    teamStore.teams[0] = {
      members: [externalId],
      production: {
        members: [{ externalId, berries: 5 }]
      }
    } as any

    await nextTick()

    const tabs = wrapper.findAll('.v-tab')
    await tabs[0].trigger('click')
    await nextTick()

    const overviewTabContent = wrapper.find('.v-window-item.v-tabs-window-item .v-card-text')
    expect(overviewTabContent.text()).toMatchInlineSnapshot(
      `
      "{
        "externalId": "external-id",
        "berries": 5
      }"
    `
    )
  })

  it('renders tab images correctly', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    const externalId = 'external-id'
    const mockPokemon = { name: 'Pikachu', externalId, pokemon: pokemon.PIKACHU } as any
    pokemonStore.upsertPokemon(mockPokemon)

    teamStore.currentIndex = 0
    teamStore.teams[0] = {
      members: [externalId],
      production: {
        members: [{ externalId, production: '5 Berries' }]
      }
    } as any

    await nextTick()

    const tabImage = wrapper.find('.v-tab img')
    expect(tabImage.attributes('src')).toBe('/images/pokemon/pikachu.png')
  })
})
