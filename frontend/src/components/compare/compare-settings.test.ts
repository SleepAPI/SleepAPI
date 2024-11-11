import CompareSettings from '@/components/compare/compare-settings.vue'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { createMockPokemon } from '@/vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { berry } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('CompareSettings', () => {
  let wrapper: VueWrapper<InstanceType<typeof CompareSettings>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(CompareSettings)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('opens advanced menu on button click', async () => {
    const button = wrapper.find('button[aria-label="open advanced menu"]')
    expect(wrapper.vm.advancedMenu).toBe(false)

    await button.trigger('click')
    expect(wrapper.vm.advancedMenu).toBe(true)
  })

  it('opens sleep menu on button click', async () => {
    const openMenu = wrapper.find('button[aria-label="open advanced menu"]')
    await openMenu.trigger('click')

    const button = document.querySelector('[aria-label="sleep score"]') as HTMLElement
    expect(wrapper.vm.isTimePickerOpen).toBe(false)
    expect(button).not.toBeNull()
    button.click()

    expect(wrapper.vm.isTimePickerOpen).toBe(true)
  })

  it('toggles camp icon greyscale class correctly', async () => {
    const comparisonStore = useComparisonStore()
    const openMenu = wrapper.find('button[aria-label="open advanced menu"]')
    await openMenu.trigger('click')

    expect(comparisonStore.camp).toBe(false)
    const campButton = document.querySelector('[aria-label="camp icon"]') as HTMLElement

    expect(campButton.classList).toContain('greyscale')

    campButton.click()
    await nextTick()
    expect(comparisonStore.camp).toBe(true)
    expect(campButton.classList).not.toContain('greyscale')
  })

  it('calculates sleepScore correctly', async () => {
    wrapper.vm.bedtime = '21:30'
    wrapper.vm.wakeup = '06:00'

    const sleepScore = wrapper.vm.sleepScore
    expect(sleepScore).toBe(100) // For 8.5 hours, it should return 100%
  })

  it('deletes the team and resets the state', async () => {
    const comparisonStore = useComparisonStore()
    const member = createMockPokemon()

    comparisonStore.addMember({
      externalId: member.externalId,
      ingredients: [],
      skillProcs: 5,
      berries: [
        {
          amount: 10,
          berry: berry.BELUE,
          level: member.level
        }
      ],
      ingredientPercentage: 0,
      skillPercentage: 0,
      carrySize: 0,
      averageEnergy: 0,
      averageFrequency: 0,
      dayHelps: 0,
      nightHelps: 0,
      nrOfHelps: 0,
      sneakySnackHelps: 0,
      spilledIngredients: [],
      totalRecovery: 0,
      sneakySnack: []
    })

    expect(comparisonStore.members.length).toBe(1)
    await wrapper.vm.deleteTeam()
    expect(comparisonStore.members.length).toBe(0)
    expect(wrapper.vm.bedtime).toBe(comparisonStore.bedtime)
    expect(wrapper.vm.wakeup).toBe(comparisonStore.wakeup)
  })

  it('displays tooltip correctly', async () => {
    const openMenu = wrapper.find('button[aria-label="open advanced menu"]')
    await openMenu.trigger('click')

    const button = document.querySelector('[aria-label="show tooltip"]') as HTMLElement
    expect(wrapper.vm.tooltipMenu).toBe(false)

    expect(button).not.toBeNull()
    button.click()
    expect(wrapper.vm.tooltipMenu).toBe(true)
  })

  it('toggles timeWindow correctly', async () => {
    const comparisonStore = useComparisonStore()

    const openMenuButton = wrapper.find('button[aria-label="open advanced menu"]')
    await openMenuButton.trigger('click')

    const twentyFourHourBtn = document.querySelector('button[value="24H"]') as HTMLElement
    const eightHourBtn = document.querySelector('button[value="8H"]') as HTMLElement

    expect(twentyFourHourBtn).not.toBeNull()
    expect(eightHourBtn).not.toBeNull()

    expect(comparisonStore.timeWindow).toBe('24H')

    eightHourBtn.click()
    await nextTick()
    expect(comparisonStore.timeWindow).toBe('8H')

    twentyFourHourBtn.click()
    await nextTick()
    expect(comparisonStore.timeWindow).toBe('24H')
  })

  it('updates favored berries correctly', async () => {
    const comparisonStore = useComparisonStore()

    const openMenuButton = wrapper.find('button[aria-label="open advanced menu"]')
    await openMenuButton.trigger('click')

    await nextTick()

    const berriesToAdd = [berry.BELUE, berry.LUM]

    wrapper.vm.updateFavoredBerries(berriesToAdd)
    await nextTick()

    expect(comparisonStore.favoredBerries).toEqual(berriesToAdd)
  })
})
