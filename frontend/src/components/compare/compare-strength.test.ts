import CompareStrength from '@/components/compare/compare-strength.vue'
import { StrengthService } from '@/services/strength/strength-service'
import { AVERAGE_WEEKLY_CRIT_MULTIPLIER, useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useUserStore } from '@/stores/user-store'
import { createMockMemberProduction, createMockPokemon } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import {
  MAX_RECIPE_BONUS,
  MAX_RECIPE_LEVEL,
  berryPowerForLevel,
  recipeLevelBonus,
  type MemberProduction
} from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('CompareStrength', () => {
  let wrapper: VueWrapper<InstanceType<typeof CompareStrength>>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  const mockPokemon = createMockPokemon({ name: 'Ash', skillLevel: 1 })
  const mockMemberProduction: MemberProduction = createMockMemberProduction()

  beforeEach(() => {
    setActivePinia(createPinia())
    pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)
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
    const member = pokemonStore.getPokemon(mockPokemon.externalId)!

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
        mockMemberProduction.produceTotal.berries[0].berry,
        mockMemberProduction.produceTotal.berries[0].level
      ) *
      (mockMemberProduction.produceTotal.berries[0].amount ?? 1) *
      userStore.islandBonus
    expect(firstRowCells[1].text()).toContain(berryPower.toString())

    // Check ingredient power range
    const highestIngredientValue = Math.floor(
      (1 + MAX_RECIPE_BONUS / 100) *
        recipeLevelBonus[MAX_RECIPE_LEVEL] *
        userStore.islandBonus *
        AVERAGE_WEEKLY_CRIT_MULTIPLIER *
        mockMemberProduction.produceTotal.ingredients.reduce((sum, cur) => sum + cur.amount * cur.ingredient.value, 0)
    )
    expect(wrapper.vm.highestIngredientPower(mockMemberProduction)).toEqual(highestIngredientValue)

    const ingredientPower = firstRowCells[2].text()
    expect(ingredientPower).toContain(highestIngredientValue.toString())

    // Check skill value
    const skillValue = StrengthService.skillStrength({
      skill: member.pokemon.skill,
      amount: member.pokemon.skill.amount(member.skillLevel) * mockMemberProduction.skillProcs,
      berries: mockMemberProduction.produceTotal.berries.filter((b) => b.level !== member.level),
      favored: [],
      timeWindow: '24H'
    })
    expect(firstRowCells[3].text()).toContain(skillValue.toString())

    // Check total power
    const totalPower = Math.floor(berryPower + highestIngredientValue + skillValue)
    expect(firstRowCells[4].text()).toContain(totalPower.toString())

    expect(totalPower).toEqual(33436)
  })

  it('renders 8h time window correctly in data tab', async () => {
    const userStore = useUserStore()
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)
    comparisonStore.timeWindow = '8H'
    const member = pokemonStore.getPokemon(mockPokemon.externalId)!

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
        mockMemberProduction.produceTotal.berries[0].berry,
        mockMemberProduction.produceTotal.berries[0].level
      ) *
        mockMemberProduction.produceTotal.berries[0].amount *
        userStore.islandBonus *
        factor
    )
    expect(+firstRowCells[1].text()).toEqual(berryPower)

    // Check ingredient power range
    const highestIngredientValue = Math.floor(
      ((1 + MAX_RECIPE_BONUS / 100) *
        recipeLevelBonus[MAX_RECIPE_LEVEL] *
        userStore.islandBonus *
        AVERAGE_WEEKLY_CRIT_MULTIPLIER *
        mockMemberProduction.produceTotal.ingredients.reduce(
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
      skill: member.pokemon.skill,
      amount: member.pokemon.skill.amount(member.skillLevel) * mockMemberProduction.skillProcs,
      berries: mockMemberProduction.produceTotal.berries.filter((b) => b.level !== member.level),
      favored: [],
      timeWindow: '8H'
    })
    expect(firstRowCells[3].text()).toContain(skillValue.toString())

    // Check total power
    const totalPower = Math.floor(berryPower + highestIngredientValue + skillValue)
    expect(Math.abs(+firstRowCells[4].text())).toEqual(totalPower)
    expect(totalPower).toEqual(11145)
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
