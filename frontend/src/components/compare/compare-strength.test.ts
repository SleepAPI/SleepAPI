import CompareStrength from '@/components/compare/compare-strength.vue'
import { StrengthService } from '@/services/strength/strength-service'
import {
  AVERAGE_WEEKLY_CRIT_MULTIPLIER,
  useComparisonStore
} from '@/stores/comparison-store/comparison-store'
import { useUserStore } from '@/stores/user-store'
import type { SingleProductionExt } from '@/types/member/instanced'
import { createMockPokemon } from '@/vitest'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import {
  MAX_RECIPE_BONUS,
  MAX_RECIPE_LEVEL,
  berry,
  berryPowerForLevel,
  ingredient,
  recipeLevelBonus
} from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('CompareStrength', () => {
  let wrapper: VueWrapper<InstanceType<typeof CompareStrength>>

  const mockPokemon = createMockPokemon({ name: 'Ash', level: 10, skillLevel: 1 })
  const mockMemberProduction: SingleProductionExt = {
    member: mockPokemon,
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
    berries: [
      {
        amount: 100,
        berry: berry.BELUE,
        level: mockPokemon.level
      }
    ],
    ingredientPercentage: 0.2,
    skillPercentage: 0.02,
    carrySize: 10,
    averageEnergy: 10,
    averageFrequency: 10,
    dayHelps: 10,
    nightHelps: 10,
    nrOfHelps: 10,
    sneakySnackHelps: 10,
    spilledIngredients: [],
    totalRecovery: 10,
    sneakySnack: []
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(CompareStrength, {})
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
    const userStore = useUserStore()
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)

    await nextTick()

    const dataTabButton = wrapper.find('button[value="data"]')
    await dataTabButton.trigger('click')
    await nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)

    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells).toHaveLength(5)

    expect(firstRowCells[0].text()).toContain('Ash')

    // Check berry power
    const berryPower =
      berryPowerForLevel(
        mockMemberProduction.berries[0].berry,
        mockMemberProduction.berries[0].level
      ) *
      (mockMemberProduction.berries[0].amount ?? 1) *
      userStore.islandBonus
    expect(firstRowCells[1].text()).toContain(berryPower.toString())

    // Check ingredient power range
    const highestIngredientValue = Math.floor(
      (1 + MAX_RECIPE_BONUS / 100) *
        recipeLevelBonus[MAX_RECIPE_LEVEL] *
        userStore.islandBonus *
        AVERAGE_WEEKLY_CRIT_MULTIPLIER *
        mockMemberProduction.ingredients.reduce(
          (sum, cur) => sum + cur.amount * cur.ingredient.value,
          0
        )
    )
    expect(wrapper.vm.highestIngredientPower(mockMemberProduction)).toEqual(highestIngredientValue)

    const ingredientPower = firstRowCells[2].text()
    expect(ingredientPower).toContain(highestIngredientValue.toString())

    // Check skill value
    const skillValue = StrengthService.skillStrength({
      skill: mockMemberProduction.member.pokemon.skill,
      amount:
        mockMemberProduction.member.pokemon.skill.amount[
          mockMemberProduction.member.skillLevel - 1
        ] * mockMemberProduction.skillProcs,
      berries: mockMemberProduction.berries.filter(
        (b) => b.level !== mockMemberProduction.member.level
      ),
      favored: [],
      timeWindow: '24H'
    })
    expect(firstRowCells[3].text()).toContain(skillValue.toString())

    // Check total power
    const totalPower = Math.floor(berryPower + highestIngredientValue + skillValue)
    expect(firstRowCells[4].text()).toContain(totalPower.toString())

    expect(totalPower).toEqual(40051)
  })

  it('renders 8h time window correctly in data tab', async () => {
    const userStore = useUserStore()
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)
    comparisonStore.timeWindow = '8H'

    await nextTick()

    const dataTabButton = wrapper.find('button[value="data"]')
    await dataTabButton.trigger('click')
    await nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)

    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells).toHaveLength(5)

    expect(firstRowCells[0].text()).toContain('Ash')

    // Check berry power
    const factor = 1 / 3
    const berryPower = Math.floor(
      berryPowerForLevel(
        mockMemberProduction.berries[0].berry,
        mockMemberProduction.berries[0].level
      ) *
        mockMemberProduction.berries[0].amount *
        userStore.islandBonus *
        factor
    )
    expect(Math.abs(+firstRowCells[1].text() - berryPower)).toBeLessThanOrEqual(1)

    // Check ingredient power range
    const highestIngredientValue = Math.floor(
      ((1 + MAX_RECIPE_BONUS / 100) *
        recipeLevelBonus[MAX_RECIPE_LEVEL] *
        userStore.islandBonus *
        AVERAGE_WEEKLY_CRIT_MULTIPLIER *
        mockMemberProduction.ingredients.reduce(
          (sum, cur) => sum + cur.amount * cur.ingredient.value,
          0
        )) /
        3
    )
    expect(wrapper.vm.highestIngredientPower(mockMemberProduction)).toEqual(highestIngredientValue)

    const ingredientPower = firstRowCells[2].text()
    expect(ingredientPower).toContain(highestIngredientValue.toString())

    // Check skill value
    const skillValue = StrengthService.skillStrength({
      skill: mockMemberProduction.member.pokemon.skill,
      amount:
        mockMemberProduction.member.pokemon.skill.amount[
          mockMemberProduction.member.skillLevel - 1
        ] * mockMemberProduction.skillProcs,
      berries: mockMemberProduction.berries.filter(
        (b) => b.level !== mockMemberProduction.member.level
      ),
      favored: [],
      timeWindow: '8H'
    })
    expect(firstRowCells[3].text()).toContain(skillValue.toString())

    // Check total power
    const totalPower = Math.floor(berryPower + highestIngredientValue + skillValue)
    expect(Math.abs(+firstRowCells[4].text() - totalPower)).toBeLessThanOrEqual(1)
    expect(totalPower).toEqual(13350)
  })

  it('displays the correct number of headers', async () => {
    const dataTabButton = wrapper.find('button[value="data"]')
    await dataTabButton.trigger('click')
    await nextTick()

    const headers = wrapper.findAll('thead th')
    expect(headers.length).toBe(5)
    expect(headers[0].text()).toBe('Name')
    expect(headers[1].text()).toBe('Berry')
    expect(headers[2].text()).toBe('Ingredient')
    expect(headers[3].text()).toBe('Skill')
    expect(headers[4].text()).toBe('Total')
  })
})
