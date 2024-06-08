import MainskillButton from '@/components/calculator/pokemon-input/mainskill-button.vue'
import type { PokemonInstanceExt } from '@/types/member/instanced'
import { VueWrapper, mount } from '@vue/test-utils'
import { pokemon } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('MainskillButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof MainskillButton>>
  const samplePokemon = { pokemon: pokemon.PIKACHU, skillLevel: 0 } as PokemonInstanceExt

  beforeEach(() => {
    wrapper = mount(MainskillButton, {
      props: {
        pokemonInstance: samplePokemon
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
    const changedPokemon = {
      skillLevel: samplePokemon.skillLevel,
      pokemon: {
        ...samplePokemon.pokemon,
        skill: {
          ...samplePokemon.pokemon.skill,
          maxLevel: 4
        }
      }
    } as PokemonInstanceExt
    await wrapper.setProps({
      pokemonInstance: changedPokemon
    })
    expect(wrapper.vm.defaultValues).toEqual({ 1: '1', 2: '2', 3: '3', 4: '4' })
  })
})
