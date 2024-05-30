import TeamName from '@/components/calculator/team-name.vue' // Adjust the import path as needed
import { TeamService } from '@/services/team/team-service'
import { useNotificationStore } from '@/stores/notification-store'
import { useTeamStore } from '@/stores/team/team-store'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('TeamSlotName', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamName>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(TeamName)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('displays team name correctly', async () => {
    const teamStore = useTeamStore()
    teamStore.loadingTeams = false
    wrapper = mount(TeamName)

    const teamNameSpan = wrapper.find('#teamNameText')
    expect(teamNameSpan.exists()).toBe(true)
    expect(teamNameSpan.text()).toBe('Log in to save your teams')
  })

  it('displays skeleton loader while team is loading', async () => {
    const teamStore = useTeamStore()
    teamStore.loadingTeams = true

    wrapper = mount(TeamName)

    const skeletonLoader = wrapper.find('.v-skeleton-loader')
    expect(skeletonLoader.exists()).toBe(true)
  })

  it('opens edit dialog on click', async () => {
    const card = wrapper.find('.v-card')
    await card.trigger('click')

    expect(wrapper.vm.isEditDialogOpen).toBe(true)
    const editTeamNameDialog = document.querySelector('#editTeamNameDialog')
    expect(editTeamNameDialog).not.toBeNull()

    if (editTeamNameDialog) {
      const style = window.getComputedStyle(editTeamNameDialog)
      expect(style.display).not.toBe('none')
    }
  })

  it('filters input correctly', async () => {
    await wrapper.setData({ isEditDialogOpen: true })

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    textarea.value = 'Team123!'
    textarea.dispatchEvent(new Event('input'))

    expect(wrapper.vm.editedTeamName).toBe('Team123!')
  })

  it('saves edited team name', async () => {
    const teamStore = useTeamStore()
    teamStore.updateTeamName = vi.fn()
    await wrapper.setData({ isEditDialogOpen: true, editedTeamName: 'New Team Name' })
    TeamService.createOrUpdateTeam = vi.fn()

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    saveButton.click()

    expect(teamStore.updateTeamName).toHaveBeenCalledWith('New Team Name')
  })

  it('handles notification correctly when opening dialog', async () => {
    const notificationStore = useNotificationStore()
    notificationStore.showTeamNameNotification = true

    const card = wrapper.find('.v-card')
    await card.trigger('click')

    expect(notificationStore.showTeamNameNotification).toBe(false)
  })

  it('closes edit dialog on cancel', async () => {
    await wrapper.setData({ isEditDialogOpen: true })

    const cancelButton = document.querySelector('#cancelButton')
    expect(cancelButton).not.toBeNull()
    ;(cancelButton as HTMLElement).click()

    expect(wrapper.vm.isEditDialogOpen).toBe(false)
  })

  it('rerolls team name correctly', async () => {
    await wrapper.setData({ isEditDialogOpen: true })

    const rerollButton = document.querySelector('#rerollButton') as HTMLElement
    expect(rerollButton).not.toBeNull()
    rerollButton.click()

    const newTeamName = wrapper.vm.editedTeamName
    expect(newTeamName).not.toBe('')
    expect(newTeamName.length).toBeLessThanOrEqual(wrapper.vm.maxTeamNameLength)
  })

  it('saves default team name when edited name is empty', async () => {
    const teamStore = useTeamStore()
    teamStore.updateTeamName = vi.fn()
    await wrapper.setData({ isEditDialogOpen: true, editedTeamName: '' })
    TeamService.createOrUpdateTeam = vi.fn()

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    saveButton.click()

    const expectedDefaultName = `Helper team ${teamStore.currentIndex + 1}`
    expect(teamStore.updateTeamName).toHaveBeenCalledWith(expectedDefaultName)
  })
})
