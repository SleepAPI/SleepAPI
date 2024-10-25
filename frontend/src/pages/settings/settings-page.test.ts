import { clearCacheKeepLogin } from '@/stores/store-service'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SettingsPage from './settings-page.vue'

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
    expect(wrapper.find('.text-h4').text()).toBe('Settings')
  })

  it('handles clear cache button click', async () => {
    const clearButton = wrapper.findAll('button').find((button) => button.text() === 'Clear cache')
    await clearButton?.trigger('click')
    expect(clearCacheKeepLogin).toHaveBeenCalled()
  })

  it('displays site version disclaimer', () => {
    const disclaimerElement = wrapper.find('.font-italic')
    expect(disclaimerElement.exists()).toBe(true)
    expect(disclaimerElement.text()).toBe('Please provide this when you bug report')
  })
})
