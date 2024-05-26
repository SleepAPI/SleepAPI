import TeamName from '@/components/calculator/team-name.vue' // Adjust the import path as needed
import { TeamService } from '@/services/team/team-service'
import { useNotificationStore } from '@/stores/notification-store'
import { useUserStore } from '@/stores/user-store'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('TeamSlotName', () => {
  let wrapper: VueWrapper<InstanceType<typeof TeamName>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(TeamName, {
      props: {
        loadingTeams: false,
        teamIndex: 1,
        teamName: 'Old Team Name',
        teamCamp: true
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('displays team name correctly', () => {
    const teamNameSpan = wrapper.find('.team-name span')
    expect(teamNameSpan.exists()).toBe(true)
    expect(teamNameSpan.text()).toBe('Old Team Name')
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
    await wrapper.setData({ isEditDialogOpen: true, editedTeamName: 'New Team Name' })
    TeamService.createOrUpdateTeam = vi.fn()

    const saveButton = document.querySelector('#saveButton') as HTMLElement
    expect(saveButton).not.toBeNull()
    saveButton.click()

    expect(TeamService.createOrUpdateTeam).toHaveBeenCalledWith(1, {
      camp: true,
      name: 'New Team Name'
    })

    expect(wrapper.emitted('update-team-name')).toBeTruthy()
    expect(wrapper.emitted('update-team-name')![0]).toEqual(['New Team Name'])
  })

  it('disables card when user is not logged in', async () => {
    const userStore = useUserStore()
    userStore.tokens = null

    const teamNameCard = wrapper.find('#teamNameCard')
    expect(teamNameCard.exists()).toBeTruthy()
    expect(teamNameCard.classes()).toContain('v-card--disabled')
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
})
