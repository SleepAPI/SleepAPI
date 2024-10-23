import '@/assets/main.scss'
import SneaselHomeIcon from '@/components/icons/sneasel-home-icon.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

describe('SneaselHomeIcon', () => {
  it('renders correctly', () => {
    const wrapper = mount(SneaselHomeIcon)

    expect(wrapper.html()).toMatchInlineSnapshot(
      `
      "<div class="coin">
        <div class="heads"></div>
        <div class="tails"></div>
      </div>"
    `
    )
  })

  it('contains a div with the class coin', () => {
    const wrapper = mount(SneaselHomeIcon)
    const coinDiv = wrapper.find('.coin')

    expect(coinDiv.exists()).toBe(true)
  })

  it('contains heads and tails div elements', () => {
    const wrapper = mount(SneaselHomeIcon)
    const headsDiv = wrapper.find('.heads')
    const tailsDiv = wrapper.find('.tails')

    expect(headsDiv.exists()).toBe(true)
    expect(tailsDiv.exists()).toBe(true)
  })

  it('spins the coin on click', async () => {
    const wrapper = mount(SneaselHomeIcon)
    const coinDiv = wrapper.find('.coin')
    const spy = vi.spyOn(wrapper.vm, 'spinCoin')

    await coinDiv.trigger('click')
    await nextTick()

    expect(spy).toHaveBeenCalled()
    expect((coinDiv.element as HTMLElement).style.transform).toMatch(/rotateY\(\d+deg\)/)
  })

  it('automatically spins the coin every 10 seconds', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SneaselHomeIcon)

    const coinDiv = wrapper.find('.coin')
    const initialTransform = (coinDiv.element as HTMLElement).style.transform
    expect(initialTransform).toBe('')

    vi.advanceTimersByTime(10000)
    await nextTick()

    const updatedTransform = (coinDiv.element as HTMLElement).style.transform
    expect(updatedTransform).toBe('rotateY(540deg)')

    vi.useRealTimers()
  })

  it('clears interval on unmount', () => {
    vi.useFakeTimers()
    const wrapper = mount(SneaselHomeIcon)
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval')

    wrapper.unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()

    vi.useRealTimers()
  })
})
