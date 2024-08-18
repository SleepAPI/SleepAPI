import PokeboxList from '@/components/pokemon-input/menus/pokebox-list.vue'
import { UserService } from '@/services/user/user-service'
import { mount, VueWrapper } from '@vue/test-utils'
import { nature, pokemon, type PokemonInstanceExt } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/user/user-service', () => ({
  UserService: {
    getUserPokemon: vi.fn()
  }
}))

describe('PokeboxList', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokeboxList>>

  const mockPokemon: PokemonInstanceExt = {
    name: 'Pikachu',
    level: 10,
    pokemon: pokemon.PIKACHU,
    externalId: 'some-id',
    carrySize: 1,
    ingredients: [],
    shiny: false,
    ribbon: 0,
    subskills: [],
    saved: true,
    version: 1,
    skillLevel: 1,
    nature: nature.BASHFUL
  }

  beforeEach(async () => {
    UserService.getUserPokemon = vi.fn().mockResolvedValue([mockPokemon])
    wrapper = mount(PokeboxList)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays saved Pokémon correctly', async () => {
    const listItems = wrapper.findAll('.v-list-item')
    expect(listItems.length).toBe(1)
    expect(listItems[0].text()).toContain('Pikachu')
    expect(listItems[0].text()).toContain('Level 10')
  })

  it('handles empty Pokémon list correctly', async () => {
    UserService.getUserPokemon = vi.fn().mockResolvedValueOnce([])

    wrapper = mount(PokeboxList)

    const noMonsMessage = wrapper.find('.text-center')
    expect(noMonsMessage.exists()).toBe(true)
    expect(noMonsMessage.text()).toBe('No saved mons')
  })

  it('emits save event when a Pokémon is selected', async () => {
    const listItem = wrapper.find('.v-list-item')
    await listItem.trigger('click')

    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')![0][0]).toEqual(mockPokemon)
  })
})
