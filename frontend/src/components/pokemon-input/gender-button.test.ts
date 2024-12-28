import GenderButton from '@/components/pokemon-input/gender-button.vue'
import { createMockPokemon } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { pokemon, RandomUtils } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('GenderButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof GenderButton>>

  beforeEach(() => {
    wrapper = mount(GenderButton, {
      props: {
        pokemonInstance: createMockPokemon()
      }
    })
  })

  it('renders male icon when gender is male', async () => {
    const mockPokemonInstance = createMockPokemon({ gender: 'male' })
    await wrapper.setProps({
      pokemonInstance: mockPokemonInstance
    })

    const icon = wrapper.find('i.mdi-gender-male')
    expect(icon.exists()).toBe(true)
    expect(icon.isVisible()).toBe(true)
  })

  it('renders female icon when gender is female', async () => {
    const mockPokemonInstance = createMockPokemon({ gender: 'female' })
    await wrapper.setProps({
      pokemonInstance: mockPokemonInstance
    })

    const icon = wrapper.find('i.mdi-gender-female')
    expect(icon.exists()).toBe(true)
    expect(icon.isVisible()).toBe(true)
  })

  it('toggles gender and emits update-gender event', async () => {
    await wrapper.setProps({
      pokemonInstance: createMockPokemon({ gender: 'male' })
    })

    const button = wrapper.find('.v-btn')
    await button.trigger('click')

    expect(wrapper.emitted('update-gender')).toBeTruthy()
    expect(wrapper.emitted('update-gender')?.[0]).toEqual(['female'])

    await wrapper.setProps({
      pokemonInstance: createMockPokemon({ gender: 'female' })
    })

    await button.trigger('click')
    expect(wrapper.emitted('update-gender')?.[1]).toEqual(['male'])
  })

  it('updates gender when the Pokémon changes', async () => {
    RandomUtils.roll = vi.fn().mockReturnValue(true)

    await wrapper.setProps({
      pokemonInstance: createMockPokemon({ pokemon: pokemon.GALLADE })
    })

    expect(wrapper.emitted('update-gender')?.[0]).toEqual(['male'])
  })

  it('does not render the button if gender is undefined', async () => {
    const mockPokemonInstance = createMockPokemon({ gender: undefined })
    await wrapper.setProps({
      pokemonInstance: mockPokemonInstance
    })

    const button = wrapper.find('.v-btn')
    expect(button.exists()).toBe(false)
  })
})
