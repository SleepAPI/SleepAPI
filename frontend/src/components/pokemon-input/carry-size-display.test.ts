import CarrySizeDisplay from '@/components/pokemon-input/carry-size-display.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { commonMocks, subskill, type Pokemon, type PokemonInstance, type SubskillInstance } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('CarrySizeDisplay', () => {
  let wrapper: VueWrapper<InstanceType<typeof CarrySizeDisplay>>

  const initialPokemon = {
    pokemon: commonMocks.mockPokemon(), //base carry size 0
    carrySize: 0,
    level: 50,
    subskills: [] as SubskillInstance[]
  } as PokemonInstance

  const venusaur = {
    name: 'Venusaur',
    carrySize: 15,
    previousEvolutions: 2
  } as Pokemon

  beforeEach(() => {
    wrapper = mount(CarrySizeDisplay, {
      props: {
        pokemonInstance: {
          ...initialPokemon,
          pokemon: venusaur,
          carrySize: 20,
          subskills: [{ level: 10, subskill: subskill.INVENTORY_S }],
          ribbon: 2
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('displays calculated actual carry size', async () => {
    expect(wrapper.text()).toContain('Carry size 29')
  })

  it('updates displayed carry size when pokemon instance changes', async () => {
    const newPokemonInstance = {
      ...initialPokemon,
      pokemon: venusaur,
      carrySize: 25,
      subskills: [{ level: 10, subskill: subskill.INVENTORY_S }],
      ribbon: 1
    }

    await wrapper.setProps({
      pokemonInstance: newPokemonInstance
    })

    expect(wrapper.text()).toContain('Carry size 32')
  })

  it('displays carry size with no subskills or ribbon correctly', async () => {
    const simplePokemonInstance = {
      ...initialPokemon,
      pokemon: venusaur,
      carrySize: 15,
      subskills: [],
      ribbon: 0
    }

    await wrapper.setProps({
      pokemonInstance: simplePokemonInstance
    })

    expect(wrapper.text()).toContain('Carry size 15')
  })
})
