import { VueWrapper, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { useVersionStore } from '@/stores/version-store/version-store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import ServiceWorkerUpdate from './service-worker-update.vue'

const MOCK_APP_VERSION = '2.0.0'

describe('Service worker update', () => {
  let wrapper: VueWrapper<InstanceType<typeof ServiceWorkerUpdate>>
  let versionStore: ReturnType<typeof useVersionStore>

  beforeEach(() => {
    vi.stubGlobal('APP_VERSION', MOCK_APP_VERSION)
    setActivePinia(createPinia())
    versionStore = useVersionStore()
    wrapper = mount(ServiceWorkerUpdate)

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: vi.fn().mockResolvedValue({
          onupdatefound: null
        })
      },
      writable: true
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('does not show banner if update is not found', async () => {
    wrapper.vm.updateFound = true
    await nextTick()
    expect(wrapper.find('v-banner').exists()).toBe(false)
  })

  it('shows banner when service worker update is found', async () => {
    wrapper.vm.updateFound = true
    await nextTick()

    expect(wrapper.find('.v-banner').exists()).toBe(true)
  })

  it('updates version if updateFound is true on mount', async () => {
    versionStore.version = '1.0.0'
    versionStore.updateVersion = vi.fn()
    mount(ServiceWorkerUpdate)
    await flushPromises()

    expect(versionStore.updateVersion).toHaveBeenCalled()
  })

  it('logs debug message when client cache is up to date', async () => {
    const consoleDebugSpy = vi.spyOn(console, 'debug')
    mount(ServiceWorkerUpdate)
    await flushPromises()

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      `Client cache up to date with version ${versionStore.version}`
    )
  })
})
