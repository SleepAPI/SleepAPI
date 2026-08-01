import MainskillButton from '@/components/pokemon-input/mainskill-button.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { GENGAR, Mainskill, PLUSLE, type AmountParams, type PokemonInstance } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('MainskillButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof MainskillButton>>
  let pokemonStore: ReturnType<typeof usePokemonStore>
  const mockPokemon = mocks.createMockPokemon()

  beforeEach(() => {
    pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)
    wrapper = mount(MainskillButton, {
      props: {
        pokemonInstance: mockPokemon
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly with provided data', async () => {
    wrapper = mount(MainskillButton, {
      props: {
        pokemonInstance: mocks.createMockPokemon({ pokemon: GENGAR, skillLevel: 3 })
      }
    })
    const textElements = wrapper.findAll('.text-x-small')
    expect(textElements[0].text()).toBe('Charge Strength SLv.3')
    expect(textElements[1].text()).toContain("Increases Snorlax's Strength on average by anywhere from 393 to 1570.")
    expect(wrapper.find('img').attributes('src')).toBe('/images/mainskill/strength.png')
  })

  it('updates the skill level through the slider', async () => {
    const activatorCard = wrapper.find('.v-card')
    await activatorCard.trigger('click')

    const slider = wrapper.findComponent({ name: 'v-slider' })
    await slider.setValue(4)
    expect(wrapper.vm.$data.mainskillLevel).toBe(4)
    expect(wrapper.emitted('update-skill-level')).toBeTruthy()
    expect(wrapper.emitted('update-skill-level')![0]).toEqual([4])
  })

  it('emits update-skill-level when mainskillLevel changes', async () => {
    await wrapper.setData({ mainskillLevel: 5 })
    expect(wrapper.emitted('update-skill-level')).toBeTruthy()
    expect(wrapper.emitted('update-skill-level')![0]).toEqual([5])
  })

  it('displays default values dynamically', async () => {
    const skillWithLowMaxLevel: Mainskill = new (class extends Mainskill {
      name = 'Test skill'
      amount = (skillLevel: number) => skillLevel
      description = (params: AmountParams) => `Test. ${params.skillLevel}`
      RP = [880, 1251, 1726, 2383]
      image = 'strength'
      activations = {}
    })(false, true)

    const changedPokemon: PokemonInstance = {
      ...mockPokemon,
      pokemon: { ...mockPokemon.pokemon, skill: skillWithLowMaxLevel }
    }
    await wrapper.setProps({
      pokemonInstance: changedPokemon
    })
    expect(wrapper.vm.defaultValues).toEqual({ 1: '1', 2: '2', 3: '3', 4: '4' })
  })

  it('passes ingredient to skill description for skills that require it', async () => {
    const pluslePokemon = mocks.createMockPokemon({
      pokemon: PLUSLE,
      skillLevel: 1
    })
    wrapper = mount(MainskillButton, {
      props: {
        pokemonInstance: pluslePokemon
      }
    })

    const textElements = wrapper.findAll('.text-x-small')
    const descriptionText = textElements[1].text()

    expect(descriptionText).toContain('Gets you 5 ingredients chosen at random')
    expect(descriptionText).toContain('additional 6 Coffee')
    expect(descriptionText).not.toContain('undefined')
  })
})
