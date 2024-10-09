import PatreonIcon from '@/components/icons/icon-patreon.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('PatreonIcon', () => {
  it('renders correctly', () => {
    const wrapper = mount(PatreonIcon)
    expect(wrapper.exists()).toBe(true)
  })

  it('has correct SVG structure', () => {
    const wrapper = mount(PatreonIcon)
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    expect(svg.attributes('width')).toBe('24')
    expect(svg.attributes('height')).toBe('24')
  })

  it('renders the correct path', () => {
    const wrapper = mount(PatreonIcon)
    const path = wrapper.find('path')
    expect(path.exists()).toBe(true)
    expect(path.attributes('d')).toBe(
      'M22.957 7.21c-.004-3.064-2.391-5.576-5.191-6.482-3.478-1.125-8.064-.962-11.384.604C2.357 3.231 1.093 7.391 1.046 11.54c-.039 3.411.302 12.396 5.369 12.46 3.765.047 4.326-4.804 6.068-7.141 1.24-1.662 2.836-2.132 4.801-2.618 3.376-.836 5.678-3.501 5.673-7.031Z'
    )
  })
})
