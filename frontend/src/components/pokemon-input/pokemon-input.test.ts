import PokemonInput from '@/components/pokemon-input/pokemon-input.vue'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { useUserStore } from '@/stores/user-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import {
  CarrySizeUtils,
  commonMocks,
  nature,
  RandomUtils,
  SNEASEL,
  subskill,
  WEAVILE,
  type PokemonInstance
} from 'sleepapi-common'
import { vimic } from 'vimic'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('PokemonInput', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonInput>>
  console.error = vi.fn()

  const preExistingMon: PokemonInstance = mocks.createMockPokemon()

  beforeEach(() => {
    wrapper = mount(PokemonInput, {
      props: {
        preSelectedPokemonInstance: preExistingMon
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
    const updatedPokemonInstance = wrapper.vm.$data.pokemonInstance
    expect(updatedPokemonInstance).toEqual(preExistingMon)
  })

  it('renders child components correctly', () => {
    expect(wrapper.findComponent({ name: 'PokemonButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'PokemonName' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'LevelButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'CarrySizeDisplay' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'IngredientButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'MainskillButton' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'NatureButton' }).exists()).toBe(true)
  })

  it('toggles save state correctly if logged in', async () => {
    const userStore = useUserStore()
    userStore.setInitialLoginData(commonMocks.loginResponse())
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
    vimic(RandomUtils, 'roll', () => false)
    expect(wrapper.vm.pokemonInstance.gender).toBeUndefined()

    wrapper.vm.updatePokemon(PokemonInstanceUtils.createDefaultPokemonInstance(WEAVILE))

    const pokemonInstance = wrapper.vm.pokemonInstance
    expect(pokemonInstance.pokemon).toBe(WEAVILE)
    expect(pokemonInstance.ingredients).toEqual([
      { ...SNEASEL.ingredient0[0], level: 0 },
      { ...SNEASEL.ingredient30[0], level: 30 },
      { ...SNEASEL.ingredient60[0], level: 60 }
    ])
    expect(pokemonInstance.skillLevel).toBe(2)
    expect(pokemonInstance.gender).toEqual('female')
    expect(pokemonInstance.carrySize).toBe(CarrySizeUtils.baseCarrySize(WEAVILE))
  })

  it('toggles shiny state correctly', async () => {
    const shinyButton = wrapper.find('#shinyButton')
    expect(wrapper.vm.pokemonInstance.shiny).toBe(false)

    await shinyButton.trigger('click')
    expect(wrapper.vm.pokemonInstance.shiny).toBe(true)

    await shinyButton.trigger('click')
    expect(wrapper.vm.pokemonInstance.shiny).toBe(false)
  })

  it('hides the shiny toggle for shiny-locked pokemon', () => {
    wrapper.vm.updatePokemon(mocks.createMockPokemon({ pokemon: commonMocks.mockPokemon({ shinyLocked: true }) }))
    expect(wrapper.vm.pokemonInstance.pokemon.shinyLocked).toBe(true)
    return wrapper.vm.$nextTick().then(() => {
      expect(wrapper.find('#shinyButton').exists()).toBe(false)
    })
  })

  it('does not toggle shiny for shiny-locked pokemon', () => {
    wrapper.vm.updatePokemon(
      mocks.createMockPokemon({ pokemon: commonMocks.mockPokemon({ shinyLocked: true }), shiny: false })
    )
    wrapper.vm.toggleShiny()
    expect(wrapper.vm.pokemonInstance.shiny).toBe(false)
  })

  it('updates name correctly', async () => {
    wrapper.vm.updateName('does anyone read these tests')
    expect(wrapper.vm.pokemonInstance.name).toBe('does anyone read these tests')
  })

  it('updates level correctly', async () => {
    wrapper.vm.updateLevel(67)
    expect(wrapper.vm.pokemonInstance.level).toBe(67)
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
    const testIngredient = commonMocks.mockIngredientSet()
    wrapper.vm.updateIngredient({ ingredientSet: testIngredient, ingredientLevel: 0 })
    expect(wrapper.vm.pokemonInstance.ingredients[0]).toEqual({ ...testIngredient, level: 0 })
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
    wrapper.vm.pokemonInstance.name = 'updatedName'
    const saveButton = wrapper.find('#saveButton')
    await saveButton.trigger('click')
    expect(wrapper.emitted('save')).toHaveLength(1)

    const emittedEventPayload = wrapper.emitted('save')![0][0]

    expect(emittedEventPayload).toBeInstanceOf(Object)
    expect(emittedEventPayload).toHaveProperty('name', 'updatedName')
  })
})
