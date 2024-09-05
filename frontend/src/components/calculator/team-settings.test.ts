import TeamSettings from '@/components/calculator/team-settings.vue'
import { TeamService } from '@/services/team/team-service'
import { useTeamStore } from '@/stores/team/team-store'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { berry } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

describe('TeamSettings', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamSettings>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(TeamSettings)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('toggles camp button correctly', async () => {
    const teamStore = useTeamStore()
    const toggleCampSpy = vi.spyOn(teamStore, 'toggleCamp')

    const campButton = wrapper.find('div[aria-label="camp icon"]')
    await campButton.trigger('click')
    expect(wrapper.vm.isCampButtonDisabled).toBe(true)
    expect(toggleCampSpy).toHaveBeenCalled()

    setTimeout(() => {
      expect(wrapper.vm.isCampButtonDisabled).toBe(false)
    }, 1000)
  })

  it('opens sleep menu correctly', async () => {
    const sleepButton = wrapper.find('button[aria-label="sleep score"]')
    await sleepButton.trigger('click')
    expect(wrapper.vm.isSleepScoreButtonDisabled).toBe(true)
    expect(wrapper.vm.isTimePickerOpen).toBe(true)

    setTimeout(() => {
      expect(wrapper.vm.isSleepScoreButtonDisabled).toBe(false)
    }, 1000)
  })

  it('updates sleep correctly when closing time picker', async () => {
    const teamStore = useTeamStore()
    const updateSleepSpy = vi.spyOn(teamStore, 'updateSleep')

    wrapper.vm.isTimePickerOpen = true
    await nextTick()
    wrapper.vm.isTimePickerOpen = false
    await nextTick()

    expect(updateSleepSpy).toHaveBeenCalledWith({
      bedtime: wrapper.vm.bedtime,
      wakeup: wrapper.vm.wakeup
    })
  })

  it('toggles wakeup menu correctly', async () => {
    const sleepButton = wrapper.find('button[aria-label="sleep score"]')
    await sleepButton.trigger('click')

    wrapper.vm.isWakeupOpen = false
    await nextTick()

    const menuContainer = document.querySelector('[aria-label="time menu"]')
    expect(menuContainer).not.toBeNull()

    const wakeupButton = document.querySelector('[aria-label="wakeup button"]') as HTMLElement
    expect(wakeupButton).not.toBeNull()
    wakeupButton.click()

    expect(wrapper.vm.isWakeupOpen).toBe(true)
  })

  it('toggles bedtime menu correctly', async () => {
    const sleepButton = wrapper.find('button[aria-label="sleep score"]')
    await sleepButton.trigger('click')

    wrapper.vm.isBedtimeOpen = false
    await nextTick()

    const menuContainer = document.querySelector('[aria-label="time menu"]')
    expect(menuContainer).not.toBeNull()

    const bedtimeButton = document.querySelector('[aria-label="bedtime button"]') as HTMLElement
    expect(bedtimeButton).not.toBeNull()
    bedtimeButton.click()

    expect(wrapper.vm.isBedtimeOpen).toBe(true)
  })

  it('calculates sleep score correctly', () => {
    wrapper.setData({
      bedtime: '22:00',
      wakeup: '06:00'
    })

    expect(wrapper.vm.sleepScore).toBe(94) // 8 hours of sleep
  })

  it('calculates sleep duration correctly', () => {
    wrapper.setData({
      bedtime: '22:00',
      wakeup: '06:00'
    })

    expect(wrapper.vm.calculateSleepDuration).toBe('8 hours and 0 minutes')
  })

  it('allows correct step for minutes in time picker', () => {
    const allowedStep = wrapper.vm.allowedStep
    expect(allowedStep(5)).toBe(true)
    expect(allowedStep(3)).toBe(false)
  })

  it('allows correct bedtime hours based on wakeup time', () => {
    wrapper.setData({
      wakeup: '06:00'
    })

    const allowedBedtimeHours = wrapper.vm.allowedBedtimeHours
    expect(allowedBedtimeHours(4)).toBe(true)
    expect(allowedBedtimeHours(5)).toBe(false)
  })

  it('allows correct wakeup hours based on bedtime', () => {
    wrapper.setData({
      bedtime: '22:00'
    })

    const allowedWakeupHours = wrapper.vm.allowedWakeupHours
    expect(allowedWakeupHours(7)).toBe(true)
    expect(allowedWakeupHours(22)).toBe(false)
  })

  it('clicking delete button should call server to delete team', async () => {
    TeamService.deleteTeam = vi.fn().mockResolvedValue(undefined)
    const teamStore = useTeamStore()
    const deleteTeamSpy = vi.spyOn(teamStore, 'deleteTeam')

    const deleteButton = wrapper.find('button[aria-label="delete team"]')
    await deleteButton.trigger('click')

    await nextTick()
    expect(deleteTeamSpy).toHaveBeenCalled()
  })

  it('opens the recipe menu correctly', async () => {
    const teamStore = useTeamStore()
    const button = wrapper.find('button[aria-label="select recipe"]')
    await button.trigger('click')

    expect(wrapper.vm.recipeMenu).toBe(true)

    const menuContainer = document.querySelector('[aria-label="dessert button"]') as HTMLElement
    expect(menuContainer).not.toBeNull()

    menuContainer.click()
    expect(teamStore.getCurrentTeam.recipeType).toEqual('dessert')
  })

  it('shall update favoredBerries on emit', async () => {
    const teamStore = useTeamStore()
    wrapper.vm.updateFavoredBerries(berry.CYAN_BERRIES)
    await nextTick()

    expect(teamStore.getCurrentTeam.favoredBerries).toEqual(berry.CYAN_BERRIES)
  })
})
