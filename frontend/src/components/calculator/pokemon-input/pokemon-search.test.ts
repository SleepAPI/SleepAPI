import PokemonSearch from '@/components/calculator/pokemon-input/pokemon-search.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { pokemon } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('@/stores/pokedex-store/pokedex-store', () => ({
  usePokedexStore: () => ({
    groupedPokedex: [
      {
        category: 'ingredient',
        list: ['Bulbasaur', 'Charmander', 'Squirtle']
      },
      {
        category: 'berry',
        list: ['Pikachu', 'Raichu']
      },
      {
        category: 'skill',
        list: ['Machop', 'Machoke', 'Machamp']
      }
    ]
  })
}))

describe('PokemonSearch', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonSearch>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(PokemonSearch, {
      props: {
        memberIndex: 0
      }
    })
  })

  it('renders GroupList when no Pokémon is selected', () => {
    expect(wrapper.findComponent({ name: 'GroupList' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'PokemonInput' }).exists()).toBe(false)
  })

  it('renders PokemonInput when a Pokémon is selected', async () => {
    const pkmn = pokemon.PIKACHU
    wrapper.vm.selectPokemon(pkmn.name)

    await nextTick()

    expect(wrapper.findComponent({ name: 'GroupList' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'PokemonInput' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'PokemonInput' }).props('selectedPokemon')).toEqual(pkmn)
  })

  it('emits cancel event when closeMenu is called', async () => {
    wrapper.vm.closeMenu()
    await nextTick()

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('selects Pokémon correctly', async () => {
    const pkmn = pokemon.PIKACHU
    wrapper.vm.selectPokemon(pkmn.name)

    await nextTick()

    expect(wrapper.vm.pokemon).toEqual(pkmn)
    expect(wrapper.findComponent({ name: 'PokemonInput' }).props('selectedPokemon')).toEqual(pkmn)
  })

  it('displays error message if Pokémon is not found', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    wrapper.vm.selectPokemon('unknown')

    await nextTick()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error selecting Pokémon')
    consoleErrorSpy.mockRestore()
  })
})
