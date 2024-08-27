import CompareMisc from '@/components/compare/compare-misc.vue'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import type { SingleProductionExt } from '@/types/member/instanced'
import { createMockPokemon } from '@/vitest'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { MathUtils, berry, ingredient } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('CompareMisc', () => {
  let wrapper: VueWrapper<InstanceType<typeof CompareMisc>>

  const mockMemberProduction: SingleProductionExt = {
    member: createMockPokemon({ name: 'Ash' }),
    ingredients: [
      {
        amount: 10,
        ingredient: ingredient.FANCY_APPLE
      },
      {
        amount: 20,
        ingredient: ingredient.HONEY
      }
    ],
    skillProcs: 5,
    berries: {
      amount: 100,
      berry: berry.BELUE
    },
    ingredientPercentage: 0.2,
    skillPercentage: 0.02,
    carrySize: 10,
    averageEnergy: 10,
    averageFrequency: 60,
    dayHelps: 10,
    nightHelps: 10,
    nrOfHelps: 20,
    sneakySnackHelps: 5,
    spilledIngredients: [
      { amount: 5, ingredient: ingredient.FANCY_APPLE },
      { amount: 3, ingredient: ingredient.HONEY }
    ],
    totalRecovery: 10,
    sneakySnack: {
      amount: 5,
      berry: berry.BELUE
    },
    collectFrequency: { hour: 0, minute: 30, second: 0 }
  }

  beforeEach(() => {
    setActivePinia(createPinia())
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
    comparisonStore.addMember(mockMemberProduction)

    await nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)

    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells.length).toBe(14)

    // Check member name
    expect(firstRowCells[0].text()).toContain('Ash')

    // Check ingredient percentage
    expect(firstRowCells[1].text()).toContain(
      MathUtils.round(mockMemberProduction.ingredientPercentage * 100, 1).toString()
    )

    // Check skill percentage
    expect(firstRowCells[2].text()).toContain(
      MathUtils.round(mockMemberProduction.skillPercentage * 100, 1).toString()
    )

    // Check carry limit
    expect(firstRowCells[3].text()).toContain(mockMemberProduction.carrySize.toString())

    // Check spilled ingredients
    const spilledIngredients = firstRowCells[4].text()
    expect(spilledIngredients).toContain('5')
    expect(spilledIngredients).toContain('3')

    // Check sneaky snack
    const sneakySnack = firstRowCells[5].text()
    expect(sneakySnack).toContain('5')

    // Check collect frequency
    const collectFrequency = firstRowCells[6].text()
    expect(collectFrequency).toContain('00:30:00')

    // Check average frequency
    const averageFrequency = firstRowCells[7].text()
    expect(averageFrequency).toContain('00:01:00')

    expect(firstRowCells[8].text()).toContain(mockMemberProduction.averageEnergy.toString())
    expect(firstRowCells[9].text()).toContain(mockMemberProduction.totalRecovery.toString())
    expect(firstRowCells[10].text()).toContain(mockMemberProduction.nrOfHelps.toString())
    expect(firstRowCells[11].text()).toContain(mockMemberProduction.dayHelps.toString())
    expect(firstRowCells[12].text()).toContain(mockMemberProduction.nightHelps.toString())
    expect(firstRowCells[13].text()).toContain(mockMemberProduction.sneakySnackHelps.toString())
  })

  it('displays spilled ingredient images correctly', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)

    await nextTick()

    const spilledIngredientImages = wrapper.findAll('tbody tr td:nth-child(5) .v-img img')
    expect(spilledIngredientImages.length).toBe(2)
    expect(spilledIngredientImages[0].attributes('src')).toBe('/images/ingredient/apple.png')
    expect(spilledIngredientImages[1].attributes('src')).toBe('/images/ingredient/honey.png')
  })

  it('displays sneaky snack image correctly', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)

    await nextTick()

    const sneakySnackImage = wrapper.find('tbody tr td:nth-child(6) .v-img img')
    expect(sneakySnackImage.attributes('src')).toBe('/images/berries/belue.png')
  })

  it('displays the correct number of headers', () => {
    const headers = wrapper.findAll('thead th')
    expect(headers.length).toBe(14)
    expect(headers[0].text()).toBe('Name')
    expect(headers[1].text()).toBe('Ingredient percentage')
    expect(headers[2].text()).toBe('Skill percentage')
    expect(headers[3].text()).toBe('Carry limit')
    expect(headers[4].text()).toBe('Spilled ingredients')
    expect(headers[5].text()).toBe('Sneaky snack')
    expect(headers[6].text()).toBe('Time to full carry')
    expect(headers[7].text()).toBe('Average frequency')
    expect(headers[8].text()).toBe('Average energy')
    expect(headers[9].text()).toBe('Total recovery')
    expect(headers[10].text()).toBe('Total helps')
    expect(headers[11].text()).toBe('Day helps')
    expect(headers[12].text()).toBe('Night helps')
    expect(headers[13].text()).toBe('Sneaky snack helps')
  })
})
