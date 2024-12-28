import PokemonInput from '@/components/pokemon-input/pokemon-input.vue'
import { useUserStore } from '@/stores/user-store'
import { createMockPokemon } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { ingredient } from 'sleepapi-common'
import { maxCarrySize, nature, pokemon, subskill, type PokemonInstanceExt } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('PokemonInput', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonInput>>
  console.error = vi.fn()

  const preExistingMon: PokemonInstanceExt = createMockPokemon()

  beforeEach(() => {
    setActivePinia(createPinia())

    wrapper = mount(PokemonInput, {
      props: {
        pokemonFromPreExist: undefined,
        pokemonFromSearch: undefined
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', () => {
    expect(console.error).toHaveBeenCalledWith('Missing both cached and search input mon, contact developer')
    expect(wrapper.exists()).toBe(true)
  })

  it('shall update data from cache on mount', () => {
    wrapper = mount(PokemonInput, {
      props: {
        pokemonFromPreExist: preExistingMon,
        pokemonFromSearch: undefined
      }
    })
    const updatedPokemonInstance = wrapper.vm.$data.pokemonInstance
    expect(updatedPokemonInstance).toEqual(preExistingMon)
  })

  it('shall update data coming from pokemon search as selectedPokemon on mount', () => {
    wrapper = mount(PokemonInput, {
      props: {
        pokemonFromPreExist: undefined,
        pokemonFromSearch: pokemon.GALLADE
      }
    })
    const updatedPokemonInstance = wrapper.vm.$data.pokemonInstance
    expect(updatedPokemonInstance).not.toEqual(preExistingMon)
    expect(updatedPokemonInstance.pokemon).not.toEqual(pokemon.MOCK_POKEMON)

    expect(updatedPokemonInstance.pokemon).toEqual(pokemon.GALLADE)
    expect(updatedPokemonInstance.carrySize).toBe(maxCarrySize(pokemon.GALLADE))
  })

  it('renders child components correctly', () => {
    expect(wrapper.findComponent({ name: 'PokemonButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'PokemonName' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'LevelButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'CarrySizeButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'IngredientButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'MainskillButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'NatureButton' }).exists()).toBe(true)
  })

  it('toggles save state correctly if logged in', async () => {
    const userStore = useUserStore()
    userStore.setTokens({
      accessToken: 'token1',
      expiryDate: 10,
      refreshToken: 'token2'
    })
    const saveButton = wrapper.find('#saveIcon')
    expect(wrapper.vm.pokemonInstance.saved).toBe(false)

    await saveButton.trigger('click')
    expect(wrapper.vm.pokemonInstance.saved).toBe(true)

    await saveButton.trigger('click')
    expect(wrapper.vm.pokemonInstance.saved).toBe(false)
  })

  it('cant save if not logged in', async () => {
    const saveButton = wrapper.find('#saveIcon')
    expect(wrapper.vm.pokemonInstance.saved).toBe(false)

    await saveButton.trigger('click')
    expect(wrapper.vm.pokemonInstance.saved).toBe(false)
    expect(saveButton.classes()).toContain('nudge')
  })

  it('updates subskill correctly', async () => {
    const ss = subskill.INVENTORY_S
    wrapper.vm.updateSubskills([{ subskill: ss, level: 10 }])
    expect(wrapper.vm.pokemonInstance.subskills).toEqual([{ level: 10, subskill: ss }])
  })

  it('updates pokemon correctly', async () => {
    wrapper.vm.updatePokemon(pokemon.PIKACHU)
    expect(wrapper.vm.pokemonInstance.pokemon).toBe(pokemon.PIKACHU)
  })

  it('updates name correctly', async () => {
    wrapper.vm.updateName('does anyone read these tests')
    expect(wrapper.vm.pokemonInstance.name).toBe('does anyone read these tests')
  })

  it('updates level correctly', async () => {
    wrapper.vm.updateLevel(75)
    expect(wrapper.vm.pokemonInstance.level).toBe(75)
  })

  it('updates carry size correctly', async () => {
    wrapper.vm.updateCarry(5)
    expect(wrapper.vm.pokemonInstance.carrySize).toBe(5)
  })

  it('updates ribbon level correctly', async () => {
    wrapper.vm.updateRibbon(4)
    expect(wrapper.vm.pokemonInstance.ribbon).toBe(4)
  })

  it('updates ingredient correctly', async () => {
    const testIngredient = { name: 'Berry' } as ingredient.Ingredient
    wrapper.vm.updateIngredient({ ingredient: testIngredient, ingredientLevel: 0 })
    expect(wrapper.vm.pokemonInstance.ingredients[0].ingredient).toBe(testIngredient)
  })

  it('updates skill level correctly', async () => {
    wrapper.vm.updateSkillLevel(10)
    expect(wrapper.vm.pokemonInstance.skillLevel).toBe(10)
  })

  it('updates nature correctly', async () => {
    wrapper.vm.updateNature(nature.ADAMANT)
    expect(wrapper.vm.pokemonInstance.nature).toBe(nature.ADAMANT)
  })

  it('emits cancel event on cancel button click', async () => {
    const cancelButton = wrapper.find('#cancelButton')
    await cancelButton.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('saves data and emits cancel event on save button click', async () => {
    await wrapper.setData({
      pokemonInstance: { ...wrapper.vm.pokemonInstance, name: 'updatedName' }
    })
    const saveButton = wrapper.find('#saveButton')
    await saveButton.trigger('click')
    expect(wrapper.emitted('save')).toHaveLength(1)

    const emittedEventPayload = wrapper.emitted('save')![0][0]

    expect(emittedEventPayload).toBeInstanceOf(Object)
    expect(emittedEventPayload).toHaveProperty('name', 'updatedName')
  })
})
