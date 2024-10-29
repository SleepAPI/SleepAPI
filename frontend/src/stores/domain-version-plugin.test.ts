import domainVersionPlugin from '@/stores/domain-version-plugin'
import { createPinia, defineStore, setActivePinia, type PiniaPluginContext } from 'pinia'
import { DOMAIN_VERSION } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('domainVersionPlugin', () => {
  it('should call outdate if cached version is different from DOMAIN_VERSION', () => {
    const outdateMock = vi.fn()

    const store = defineStore('test', {
      state: () => ({
        domainVersion: 1
      }),
      actions: {
        outdate: outdateMock
      }
    })()

    const context = { store } as unknown as PiniaPluginContext

    domainVersionPlugin(context)

    expect(outdateMock).toHaveBeenCalled()
  })

  it('should not call outdate if cached version matches DOMAIN_VERSION', () => {
    const outdateMock = vi.fn()

    const store = defineStore('test', {
      state: () => ({
        domainVersion: DOMAIN_VERSION
      }),
      actions: {
        outdate: outdateMock
      }
    })()

    const context = { store } as unknown as PiniaPluginContext

    domainVersionPlugin(context)

    expect(outdateMock).not.toHaveBeenCalled()
  })

  it('should not call outdate if store does not have outdate function', () => {
    const store = defineStore('test', {
      state: () => ({
        domainVersion: 1
      })
    })()

    const context = { store } as unknown as PiniaPluginContext

    expect(() => domainVersionPlugin(context)).not.toThrow()
  })
})
