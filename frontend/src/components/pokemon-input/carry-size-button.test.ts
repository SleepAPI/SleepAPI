import CarrySizeButton from '@/components/pokemon-input/carry-size-button.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { maxCarrySize, pokemon, type PokemonInstanceExt } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('CarrySizeButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof CarrySizeButton>>

  const mockPokemon = {
    pokemon: pokemon.PIKACHU,
    carrySize: 0
  } as PokemonInstanceExt

  beforeEach(() => {
    setActivePinia(createPinia())

    wrapper = mount(CarrySizeButton, {
      props: {
        memberIndex: 0,
        pokemonInstance: mockPokemon
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with provided data', async () => {
    expect(wrapper.text()).toContain('Carry size 0')

    await wrapper.setProps({
      pokemonInstance: { ...mockPokemon, carrySize: 21 }
    })

    expect(wrapper.text()).toContain('Carry size 21')
  })

  it('displays carry size options correctly in the list', async () => {
    await wrapper.setData({ menu: true })
    const listItems = wrapper.findAllComponents({ name: 'v-list-item' })
    const expectedValues = [pokemon.PIKACHU.carrySize, maxCarrySize(pokemon.PIKACHU)]
    listItems.forEach((item, index) => {
      expect(item.text()).toBe(expectedValues[index].toString())
    })
    expect(listItems).toHaveLength(2)
  })

  it('updates carry limit when an option is selected', async () => {
    await wrapper.setData({ menu: true })
    const listItems = wrapper.findAllComponents({ name: 'v-list-item' })
    await listItems[0].trigger('click')

    expect(wrapper.emitted('update-carry')).toBeTruthy()
    expect(wrapper.emitted('update-carry')![0]).toEqual([pokemon.PIKACHU.carrySize])
  })

  it('closes the menu when a value is selected', async () => {
    await wrapper.setData({ menu: true })
    const listItems = wrapper.findAllComponents({ name: 'v-list-item' })
    await listItems[1].trigger('click')

    expect(wrapper.vm.$data.menu).toBe(false)
  })

  it('updates carry limit when the pokemon prop changes', async () => {
    const newPokemon = {
      pokemon: { name: 'Bulbasaur', carrySize: 5, previousEvolutions: 2 },
      carrySize: 10
    } as PokemonInstanceExt
    await wrapper.setProps({ pokemonInstance: newPokemon })

    expect(wrapper.emitted('update-carry')).toBeTruthy()
    expect(wrapper.emitted('update-carry')![0]).toEqual([15])
  })
})
