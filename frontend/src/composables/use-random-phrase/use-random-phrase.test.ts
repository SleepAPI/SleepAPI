import { useRandomPhrase } from '@/composables/use-random-phrase/use-random-phrase'
import { VueWrapper, mount } from '@vue/test-utils'
import type { nature } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'

const mockNature: nature.Nature = {
  name: 'Lonely',
  prettyName: 'Lonely (+speed -energy)',
  positiveModifier: 'speed',
  negativeModifier: 'energy',
  frequency: 1.1,
  ingredient: 1,
  skill: 1,
  energy: 0.88,
  exp: 1
}

const TestComponent = defineComponent({
  setup() {
    return useRandomPhrase()
  },
  template: '<div></div>'
})

describe('useRandomPhrase', () => {
  let wrapper: VueWrapper<InstanceType<typeof TestComponent>>

  beforeEach(() => {
    wrapper = mount(TestComponent)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should generate a random phrase for a given nature', async () => {
    wrapper.vm.getRandomPhrase(mockNature)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Wait for typing animation to start
    expect(wrapper.vm.randomPhrase).toBeDefined()
    expect(wrapper.vm.randomPhrase.length).toBeGreaterThan(0)
  })

  it('should not repeat the same phrase twice in a row', async () => {
    wrapper.vm.getRandomPhrase(mockNature)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Wait for typing animation to start

    const firstPhrase = wrapper.vm.randomPhrase
    wrapper.vm.getRandomPhrase(mockNature)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Wait for typing animation to start

    expect(wrapper.vm.randomPhrase).not.toBe(firstPhrase)
  })

  it('should restart typing animation when visibility changes to visible', async () => {
    wrapper.vm.getRandomPhrase(mockNature)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Wait for typing animation to start

    const originalPhrase = wrapper.vm.randomPhrase

    document.dispatchEvent(new Event('visibilitychange'))
    await nextTick()

    expect(wrapper.vm.randomPhrase).toBe(originalPhrase)
  })
})
