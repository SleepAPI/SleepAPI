import MainskillButton from '@/components/pokemon-input/mainskill-button.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { createMockPokemon } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { Mainskill } from 'sleepapi-common'
import { createBaseSkill, pokemon, type PokemonInstanceExt } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('MainskillButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof MainskillButton>>
  let pokemonStore: ReturnType<typeof usePokemonStore>
  const mockPokemon = createMockPokemon()

  beforeEach(() => {
    setActivePinia(createPinia())
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
    await wrapper.setProps({
      pokemonInstance: { pokemon: pokemon.GENGAR, skillLevel: 0 } as PokemonInstanceExt
    })
    expect(wrapper.find('.responsive-text').text()).toBe('Charge Strength S RangeLv.3')
    expect(wrapper.find('.responsive-text-small').text()).toContain(
      "Increases Snorlax's Strength on average by 981.25."
    )
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
    const skillWithLowMaxLevel: Mainskill = createBaseSkill({
      name: 'Test skill',
      amount: [1, 2, 3, 4],
      unit: 'strength',
      maxLevel: 4,
      description: 'Test.',
      RP: [880, 1251, 1726, 2383]
    })
    const changedPokemon: PokemonInstanceExt = {
      ...mockPokemon,
      pokemon: { ...mockPokemon.pokemon, skill: skillWithLowMaxLevel }
    }
    await wrapper.setProps({
      pokemonInstance: changedPokemon
    })
    expect(wrapper.vm.defaultValues).toEqual({ 1: '1', 2: '2', 3: '3', 4: '4' })
  })
})
