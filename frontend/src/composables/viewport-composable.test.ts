import { useViewport } from '@/composables/viewport-composable'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'

const TestComponent = defineComponent({
  setup() {
    const { isMobile, viewportWidth } = useViewport()
    return { isMobile, viewportWidth }
  },
  template: '<div></div>'
})

describe('useViewport composable', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 800
    })

    wrapper = mount(TestComponent)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should correctly determine if the viewport is mobile on mount', () => {
    const vm = wrapper.vm as unknown as { isMobile: boolean; viewportWidth: number }
    expect(vm.viewportWidth).toBe(800)
    expect(vm.isMobile).toBe(true)
  })

  it('should correctly determine if the viewport is not mobile', async () => {
    const vm = wrapper.vm as unknown as { isMobile: boolean; viewportWidth: number }
    expect(vm.viewportWidth).toBe(800)
    expect(vm.isMobile).toBe(true)

    window.innerWidth = 1200
    window.dispatchEvent(new Event('resize'))
    await flushPromises()
    await nextTick()

    expect(vm.viewportWidth).toBe(1200)
    expect(vm.isMobile).toBe(false)
  })
})
