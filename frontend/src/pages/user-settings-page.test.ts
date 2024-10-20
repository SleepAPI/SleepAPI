import { GoogleService } from '@/services/login/google-service'
import { useUserStore } from '@/stores/user-store'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import SettingsPage from './user-settings-page.vue'

vi.mock('@/stores/store-service', () => ({
  clearCacheKeepLogin: vi.fn()
}))

describe('SettingsPage', () => {
  let wrapper: VueWrapper<InstanceType<typeof SettingsPage>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(SettingsPage)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.text-h4').text()).toBe('User Settings')
  })

  it('handles logout button click', async () => {
    const userStore = useUserStore()
    userStore.logout = vi.fn()

    const logoutButton = wrapper.findAll('button').find((button) => button.text() === 'Logout')
    await logoutButton?.trigger('click')

    expect(userStore.logout).toHaveBeenCalled()
  })

  it('shows and closes delete account confirmation dialog', async () => {
    const deleteButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Delete account')
    await deleteButton?.trigger('click')
    expect(wrapper.vm.deleteDialog).toBe(true)

    const cancelButton = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Cancel'
    )
    expect(cancelButton).not.toBeNull()
    ;(cancelButton as HTMLElement).click()
    expect(wrapper.vm.deleteDialog).toBe(false)
  })

  it('confirms account deletion', async () => {
    const userStore = useUserStore()
    userStore.logout = vi.fn()
    GoogleService.delete = vi.fn()

    const deleteButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Delete account')
    await deleteButton?.trigger('click')
    expect(wrapper.vm.deleteDialog).toBe(true)

    const confirmButton = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'Delete'
    )
    expect(confirmButton).not.toBeNull()
    ;(confirmButton as HTMLElement).click()

    await nextTick()

    expect(GoogleService.delete).toHaveBeenCalled()
    expect(userStore.logout).toHaveBeenCalled()
    expect(wrapper.vm.deleteDialog).toBe(false)
  })

  it('displays email information disclaimer', () => {
    const disclaimerElement = wrapper.find('.font-italic')
    expect(disclaimerElement.exists()).toBe(true)
    expect(disclaimerElement.text()).toBe(
      'This is only stored on your device, we do not store personal information'
    )
  })
})
