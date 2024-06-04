import IngredientButton from '@/components/calculator/pokemon-input/ingredient-button.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { ingredient, pokemon, type IngredientSet } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest'

describe('IngredientButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof IngredientButton>>

  const mockPokemon: pokemon.Pokemon = {
    name: 'Pikachu',
    ingredient0: { ingredient: { name: 'berry' } } as IngredientSet,
    ingredient30: [
      { ingredient: { name: 'berry' } } as IngredientSet,
      { ingredient: { name: 'banana' } } as IngredientSet
    ],
    ingredient60: [
      { ingredient: { name: 'berry' } } as IngredientSet,
      { ingredient: { name: 'banana' } } as IngredientSet,
      { ingredient: { name: 'apple' } } as IngredientSet
    ]
  } as unknown as pokemon.Pokemon

  beforeEach(() => {
    wrapper = mount(IngredientButton, {
      props: {
        ingredientLevel: 60,
        pokemonLevel: 60,
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
    expect(wrapper.text()).toContain('Lv.60')
  })

  it('displays ingredient image correctly', () => {
    const avatar = wrapper.findComponent({ name: 'v-avatar' })
    expect(avatar.exists()).toBe(true)
    const img = avatar.find('img')
    expect(img.attributes('src')).toBe('/images/ingredient/berry.png')
  })

  it('displays other ingredient options in the speed dial', async () => {
    await wrapper.setData({ fab: true })
    const speedDialBtns = wrapper
      .findAllComponents({ name: 'v-btn' })
      .filter((btn) => btn.vm.$props.icon)
    expect(speedDialBtns.length).toBe(3) // including the activator button

    const ingredientBtns = speedDialBtns.slice(1)
    expect(ingredientBtns.length).toBe(2) // two options for level 60
    expect(ingredientBtns[0].find('img').attributes('src')).toBe('/images/ingredient/banana.png')
  })

  it('updates ingredient when an option is clicked', async () => {
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

    // Use nextTick to ensure any pending updates are processed
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.ingredientSet!.ingredient.name).toBe('banana')

    const emitted = wrapper.emitted('update-ingredient') as Array<
      Array<{ ingredient: ingredient.Ingredient; ingredientLevel: number }>
    >

    expect(emitted).toHaveLength(2)
    const emittedEvent = emitted[1][0]

    expect(emittedEvent.ingredient.name).toBe('banana')
    expect(emittedEvent.ingredientLevel).toBe(60)

    // Clear mock timers after the test
    vitest.useRealTimers()
  })

  it('disables the button if ingredientLevel is less than 30', async () => {
    await wrapper.setProps({ ingredientLevel: 20 })
    const button = wrapper.findComponent({ name: 'v-btn' })
    expect(button.classes()).toContain('v-btn--disabled')
  })
})
