import PokemonButton from '@/components/pokemon-input/pokemon-button.vue'
import { createMockPokemon } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ABOMASNOW, PIKACHU } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

describe('PokemonButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonButton>>

  beforeEach(() => {
    setActivePinia(createPinia())
    const mockPokemon = createMockPokemon({ pokemon: ABOMASNOW })
    wrapper = mount(PokemonButton, {
      props: {
        pokemonInstance: mockPokemon
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with no Pokémon selected', () => {
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/images/pokemon/abomasnow.png')
  })

  it('renders correctly with a Pokémon selected', async () => {
    const mockPokemon = createMockPokemon()
    await wrapper.setProps({ pokemonInstance: mockPokemon })

    await nextTick()

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/images/pokemon/pikachu.png')
  })

  it('opens Pokémon menu on button click', async () => {
    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.vm.pokemonMenu).toBe(true)
    const dialog = wrapper.findComponent({ name: 'v-dialog' })
    expect(dialog.exists()).toBe(true)
  })

  it('selects Pokémon correctly', async () => {
    const pkmn = PIKACHU
    wrapper.vm.selectPokemon(pkmn.name)

    expect(wrapper.emitted('update-pokemon')).toBeTruthy()
    expect(wrapper.emitted('update-pokemon')![0]).toEqual([pkmn])
    expect(wrapper.vm.pokemonMenu).toBe(false)
  })

  it('displays Pokémon image correctly', async () => {
    const mockPokemon = createMockPokemon()
    await wrapper.setProps({ pokemonInstance: mockPokemon })

    await nextTick()

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/images/pokemon/pikachu.png')
  })

  it('closes Pokémon menu on cancel', async () => {
    wrapper.vm.openMenu()
    expect(wrapper.vm.pokemonMenu).toBe(true)

    wrapper.vm.closeMenu()
    expect(wrapper.vm.pokemonMenu).toBe(false)
  })
})
