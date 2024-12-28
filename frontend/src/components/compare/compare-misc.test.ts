import CompareMisc from '@/components/compare/compare-misc.vue'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { createMockMemberProduction, createMockPokemon } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { MathUtils, ingredient, type MemberProduction } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('CompareMisc', () => {
  let wrapper: VueWrapper<InstanceType<typeof CompareMisc>>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  const mockPokemon = createMockPokemon()
  const mockMemberProduction: MemberProduction = createMockMemberProduction()

  beforeEach(() => {
    setActivePinia(createPinia())
    pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)
    wrapper = mount(CompareMisc)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders member data correctly', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember({
      ...mockMemberProduction,
      advanced: {
        ...mockMemberProduction.advanced,
        spilledIngredients: [
          { amount: 5, ingredient: ingredient.FANCY_APPLE },
          { amount: 3, ingredient: ingredient.HONEY }
        ],
        sneakySnack: { amount: 5, berry: mockPokemon.pokemon.berry, level: mockPokemon.level }
      }
    })

    await nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)

    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells.length).toBe(11)

    // Check member name
    expect(firstRowCells[0].text()).toContain(mockPokemon.name)

    // Check ingredient percentage
    expect(firstRowCells[1].text()).toContain(
      MathUtils.round(mockMemberProduction.advanced.ingredientPercentage * 100, 1).toString()
    )

    // Check skill percentage
    expect(firstRowCells[2].text()).toContain(
      MathUtils.round(mockMemberProduction.advanced.skillPercentage * 100, 1).toString()
    )

    // Check carry limit
    expect(firstRowCells[3].text()).toContain(mockMemberProduction.advanced.carrySize.toString())

    // Check spilled ingredients
    const spilledIngredients = firstRowCells[4].text()
    expect(spilledIngredients).toContain('5')
    expect(spilledIngredients).toContain('3')

    // Check sneaky snack
    const sneakySnack = firstRowCells[5].text()
    expect(sneakySnack).toContain('5')

    expect(firstRowCells[6].text()).toContain(mockMemberProduction.advanced.totalRecovery.toString())
    expect(firstRowCells[7].text()).toContain(mockMemberProduction.advanced.totalHelps.toString())
    expect(firstRowCells[8].text()).toContain(mockMemberProduction.advanced.dayHelps.toString())
    expect(firstRowCells[9].text()).toContain(mockMemberProduction.advanced.nightHelps.toString())
    expect(firstRowCells[10].text()).toContain(mockMemberProduction.advanced.nightHelpsAfterSS.toString())
  })

  it('displays spilled ingredient images correctly', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember({
      ...mockMemberProduction,
      advanced: {
        ...mockMemberProduction.advanced,
        spilledIngredients: [
          { amount: 5, ingredient: ingredient.FANCY_APPLE },
          { amount: 3, ingredient: ingredient.HONEY }
        ]
      }
    })

    await nextTick()

    const spilledIngredientImages = wrapper.findAll('tbody tr td:nth-child(5) .v-img img')
    expect(spilledIngredientImages.length).toBe(2)
    expect(spilledIngredientImages[0].attributes('src')).toBe('/images/ingredient/apple.png')
    expect(spilledIngredientImages[1].attributes('src')).toBe('/images/ingredient/honey.png')
  })

  it('displays sneaky snack image correctly', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember({
      ...mockMemberProduction,
      advanced: {
        ...mockMemberProduction.advanced,
        sneakySnack: { amount: 5, berry: mockPokemon.pokemon.berry, level: mockPokemon.level }
      }
    })

    await nextTick()

    const sneakySnackImage = wrapper.find('tbody tr td:nth-child(6) .v-img img')
    expect(sneakySnackImage.attributes('src')).toBe('/images/berries/grepa.png')
  })

  it('displays the correct number of headers', () => {
    const headers = wrapper.findAll('thead th')
    expect(headers.length).toBe(11)
    expect(headers[0].text()).toBe('Name')
    expect(headers[1].text()).toBe('Ingredient percentage')
    expect(headers[2].text()).toBe('Skill percentage')
    expect(headers[3].text()).toBe('Carry limit')
    expect(headers[4].text()).toBe('Spilled ingredients')
    expect(headers[5].text()).toBe('Sneaky snack')
    expect(headers[6].text()).toBe('Total recovered energy')
    expect(headers[7].text()).toBe('Total helps')
    expect(headers[8].text()).toBe('Day helps')
    expect(headers[9].text()).toBe('Night helps')
    expect(headers[10].text()).toBe('Sneaky snack helps')
  })
})
