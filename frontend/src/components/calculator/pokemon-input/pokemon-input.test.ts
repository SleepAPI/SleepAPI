import PokemonInput from '@/components/calculator/pokemon-input/pokemon-input.vue'
import { useTeamStore } from '@/stores/team/team-store'
import type { InstancedPokemonExt } from '@/types/member/instanced'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ingredient, nature, pokemon, subskill } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('PokemonInput', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonInput>>
  console.error = vi.fn()

  const preExistingMon: InstancedPokemonExt = {
    index: 0,
    version: 1,
    externalId: undefined,
    saved: false,
    pokemon: pokemon.PIKACHU,
    name: 'Spike',
    level: 60,
    carrySize: pokemon.PIKACHU.carrySize,
    skillLevel: 2,
    nature: nature.LONELY,
    subskills: [{ level: 10, subskill: subskill.HELPING_BONUS }],
    ingredients: [
      {
        level: 0,
        ingredient: pokemon.PIKACHU.ingredient0.ingredient
      },
      {
        level: 30,
        ingredient: pokemon.PIKACHU.ingredient30[0].ingredient
      },
      {
        level: 60,
        ingredient: pokemon.PIKACHU.ingredient60[0].ingredient
      }
    ]
  }

  beforeEach(() => {
    setActivePinia(createPinia())

    wrapper = mount(PokemonInput, {
      props: {
        memberIndex: 0,
        selectedPokemon: undefined
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', () => {
    expect(console.error).toHaveBeenCalledWith(
      'Missing both cached and search input mon, contact developer'
    )
    // TODO: this assert is lacking
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('h2').text()).toBe('0')
    expect(wrapper.find('h5').text()).toBe('RP')
  })

  it('shall update data from cache on mount', () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      {
        index: 0,
        name: 'Mock team',
        camp: false,
        version: 0,
        members: [preExistingMon]
      }
    ]
    wrapper = mount(PokemonInput, {
      props: {
        memberIndex: 0,
        selectedPokemon: undefined
      }
    })
    const updatedPokemonInstance = wrapper.vm.$data.pokemonInstance
    expect(updatedPokemonInstance).toEqual(preExistingMon)
  })

  it('shall update data coming from pokemon search as selectedPokemon on mount', () => {
    wrapper = mount(PokemonInput, {
      props: {
        memberIndex: 2,
        selectedPokemon: pokemon.GALLADE
      }
    })
    const updatedPokemonInstance = wrapper.vm.$data.pokemonInstance
    expect(updatedPokemonInstance).not.toEqual(preExistingMon)
    expect(updatedPokemonInstance.pokemon).not.toEqual(pokemon.MOCK_POKEMON)

    expect(updatedPokemonInstance.index).toBe(2)
    expect(updatedPokemonInstance.pokemon).toEqual(pokemon.GALLADE)
    expect(updatedPokemonInstance.carrySize).toBe(pokemon.GALLADE.maxCarrySize)
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

  it('toggles save state correctly', async () => {
    const saveButton = wrapper.find('#saveIcon')
    expect(wrapper.vm.pokemonInstance.saved).toBe(false)

    await saveButton.trigger('click')
    expect(wrapper.vm.pokemonInstance.saved).toBe(true)

    await saveButton.trigger('click')
    expect(wrapper.vm.pokemonInstance.saved).toBe(false)
  })

  it('updates subskill correctly', async () => {
    const ss = subskill.INVENTORY_S
    wrapper.vm.updateSubskill({ subskill: ss, subskillLevel: 10 })
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
    const teamStore = useTeamStore()
    await wrapper.setData({
      pokemonInstance: { ...wrapper.vm.pokemonInstance, name: 'updatedName' }
    })
    const saveButton = wrapper.find('#saveButton')
    await saveButton.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(teamStore.teams[0].members[0]!.name).toEqual('updatedName')
  })
})
