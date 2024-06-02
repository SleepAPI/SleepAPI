import CarryLimitButton from '@/components/calculator/pokemon-input/carry-limit-button.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { pokemon } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('CarryLimitButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof CarryLimitButton>>

  const mockPokemon = {
    name: 'Pikachu',
    carrySize: 10,
    maxCarrySize: 20
  } as pokemon.Pokemon

  beforeEach(() => {
    wrapper = mount(CarryLimitButton, {
      props: {
        pokemon: mockPokemon
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with provided data', () => {
    expect(wrapper.text()).toContain('Carry limit 20')
  })

  it('displays default values correctly in the list', async () => {
    await wrapper.setData({ menu: true })
    const listItems = wrapper.findAllComponents({ name: 'v-list-item' })
    const expectedValues = [10, 15, 20]
    listItems.forEach((item, index) => {
      expect(item.text()).toBe(expectedValues[index].toString())
    })
  })

  it('updates carry limit when a default value is selected', async () => {
    await wrapper.setData({ menu: true })
    const listItems = wrapper.findAllComponents({ name: 'v-list-item' })
    await listItems[0].trigger('click')

    expect(wrapper.emitted('update-limit')).toBeTruthy()
    expect(wrapper.emitted('update-limit')![0]).toEqual([10])
  })

  it('closes the menu when a value is selected', async () => {
    await wrapper.setData({ menu: true })
    const listItems = wrapper.findAllComponents({ name: 'v-list-item' })
    await listItems[1].trigger('click')

    expect(wrapper.vm.$data.menu).toBe(false)
  })

  it('updates carry limit when the pokemon prop changes', async () => {
    const newPokemon = { name: 'Bulbasaur', carrySize: 5, maxCarrySize: 15 } as pokemon.Pokemon
    await wrapper.setProps({ pokemon: newPokemon })

    expect(wrapper.vm.carryLimit).toBe(15)
  })
})
