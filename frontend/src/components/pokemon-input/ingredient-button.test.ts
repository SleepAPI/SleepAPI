import IngredientButton from '@/components/pokemon-input/ingredient-button.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import type { ingredient } from 'sleepapi-common'
import { pokemon, type IngredientInstanceExt, type IngredientSet, type PokemonInstanceExt } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest'

describe('IngredientButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof IngredientButton>>

  const mockPokemon: PokemonInstanceExt = {
    level: 60,
    pokemon: pokemon.PIKACHU,
    ingredients: [] as IngredientInstanceExt[]
  } as PokemonInstanceExt

  beforeEach(() => {
    wrapper = mount(IngredientButton, {
      props: {
        ingredientLevel: 60,
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
    // triggers the watcher
    await wrapper.setProps({
      ingredientLevel: 60,
      pokemonInstance: mockPokemon
    })

    const badge = wrapper.findComponent({ name: 'v-badge' })
    expect(wrapper.vm.locked).toBeFalsy()
    expect(wrapper.text()).toContain('Lv.60')

    const lockIcon = badge.find('i.mdi-lock')
    expect(lockIcon.isVisible()).toBe(false)
  })

  it('displays ingredient image correctly', async () => {
    // triggers the watcher
    await wrapper.setProps({
      ingredientLevel: 60,
      pokemonInstance: {
        ...mockPokemon,
        pokemon: pokemon.PINSIR
      }
    })

    const avatar = wrapper.findComponent({ name: 'v-avatar' })
    expect(avatar.exists()).toBe(true)
    expect(avatar.isVisible()).toBe(true)

    const img = avatar.find('img')
    expect(img.attributes('src')).toBe('/images/ingredient/honey.png')
  })

  it('displays other ingredient options in the speed dial', async () => {
    // triggers the watcher
    await wrapper.setProps({
      ingredientLevel: 60,
      pokemonInstance: {
        ...mockPokemon,
        pokemon: pokemon.PINSIR
      }
    })
    await wrapper.setData({ fab: true })

    expect(wrapper.vm.otherIngredientOptions).toHaveLength(2)
    const speedDialBtns = wrapper.findAllComponents({ name: 'v-btn' }).filter((btn) => btn.vm.$props.icon)
    expect(speedDialBtns.length).toBe(3) // including the activator button

    const ingredientBtns = speedDialBtns.slice(1)
    expect(ingredientBtns.length).toBe(2) // two options for level 60
    expect(ingredientBtns[0].find('img').attributes('src')).toBe('/images/ingredient/apple.png')
    expect(ingredientBtns[1].find('img').attributes('src')).toBe('/images/ingredient/sausage.png')
  })

  it('updates ingredient when an option is clicked', async () => {
    // triggers the watcher
    await wrapper.setProps({
      ingredientLevel: 60,
      pokemonInstance: {
        ...mockPokemon,
        pokemon: pokemon.PINSIR
      }
    })
    // Use fake timers
    vitest.useFakeTimers()

    await wrapper.setData({ fab: true })
    const otherIngredientBtns = wrapper
      .findAllComponents({ name: 'v-btn' })
      .filter((btn) => btn.vm.$props.icon)
      .slice(1) // remove activator button

    expect(otherIngredientBtns).toHaveLength(2)

    await otherIngredientBtns[0].trigger('click')

    // Advance timers by 300ms
    vitest.advanceTimersByTime(300)

    expect(wrapper.vm.ingredientSet!.ingredient.name).toBe('Apple')

    const emitted = wrapper.emitted('update-ingredient') as Array<
      Array<{ ingredient: ingredient.Ingredient; ingredientLevel: number }>
    >

    expect(emitted).toHaveLength(2)
    const emittedEvent = emitted[1][0]

    expect(emittedEvent.ingredient.name).toBe('Apple')
    expect(emittedEvent.ingredientLevel).toBe(60)

    // Clear mock timers after the test
    vitest.useRealTimers()
  })

  it('disables the button if ingredientLevel is less than 30', async () => {
    await wrapper.setProps({ ingredientLevel: 20 })
    const button = wrapper.findComponent({ name: 'v-btn' })
    expect(button.classes()).toContain('v-btn--disabled')
  })

  it('sets ingredientSet correctly based on ingredientLevel', async () => {
    await wrapper.setProps({
      ingredientLevel: 30,
      pokemonInstance: {
        ...mockPokemon,
        pokemon: {
          ...mockPokemon.pokemon,
          ingredient30: [{ ingredient: { name: 'Herb' }, amount: 0 } as IngredientSet]
        }
      }
    })
    expect(wrapper.vm.ingredientSet?.ingredient.name).toBe('Herb')
  })
})
