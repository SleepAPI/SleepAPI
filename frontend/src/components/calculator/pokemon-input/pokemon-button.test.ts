import PokemonButton from '@/components/calculator/pokemon-input/pokemon-button.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { pokemon } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('PokemonButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof PokemonButton>>

  beforeEach(() => {
    wrapper = mount(PokemonButton)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with no Pokémon selected', () => {
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/images/pokemon/unknown.png')
  })

  it('renders correctly with a Pokémon selected', async () => {
    const pkmn = pokemon.PIKACHU
    wrapper.setData({ pokemon: pkmn })

    await nextTick()

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/images/pokemon/pikachu.png')
  })

  it('opens Pokémon menu on button click', async () => {
    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.vm.pokemonMenu).toBe(true)
    const dialog = wrapper.findComponent({ name: 'v-dialog' })
    expect(dialog.exists()).toBe(true)
  })

  it('selects Pokémon correctly', async () => {
    const pkmn = pokemon.PIKACHU
    wrapper.setData({ pokedex: [{ category: 'berry', list: [pkmn.name] }] })

    wrapper.vm.selectPokemon(pkmn.name)
    expect(wrapper.vm.pokemon).toEqual(pkmn)
    expect(wrapper.vm.pokemonMenu).toBe(false)
    expect(wrapper.emitted('select-pokemon')).toBeTruthy()
    expect(wrapper.emitted('select-pokemon')![0]).toEqual([pkmn])
  })

  it('displays Pokémon image correctly', async () => {
    const pkmn = pokemon.PIKACHU
    wrapper.setData({ pokemon: pkmn })

    await nextTick()

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(`/images/pokemon/pikachu.png`)
  })
})
