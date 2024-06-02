import MainskillButton from '@/components/calculator/pokemon-input/mainskill-button.vue'
import { VueWrapper, mount } from '@vue/test-utils'
import { pokemon } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('MainskillButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof MainskillButton>>
  const samplePokemon = pokemon.PIKACHU

  beforeEach(() => {
    wrapper = mount(MainskillButton, {
      props: {
        pokemon: samplePokemon
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly with provided data', () => {
    expect(wrapper.find('.responsive-text').text()).toBe('Charge Strength SLv.2')
    expect(wrapper.find('.responsive-text-small').text()).toContain(
      "Increases Snorlax's Strength by 569."
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
    await wrapper.setProps({
      pokemon: {
        ...samplePokemon,
        skill: {
          ...samplePokemon.skill,
          maxLevel: 4
        }
      }
    })
    expect(wrapper.vm.defaultValues).toEqual({ 1: '1', 2: '2', 3: '3', 4: '4' })
  })
})
