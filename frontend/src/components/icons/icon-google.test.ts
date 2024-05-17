import GoogleIcon from '@/components/icons/icon-google.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('GoogleIcon', () => {
  it('renders the SVG correctly', () => {
    const wrapper = mount(GoogleIcon)

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)

    expect(svg.attributes('width')).toBe('24')
    expect(svg.attributes('height')).toBe('24')
    expect(svg.attributes('viewBox')).toBe('0 0 48 48')

    const paths = svg.findAll('path')
    expect(paths.length).toBe(4)

    expect(paths[0].attributes('fill')).toBe('#FFC107')
  })
})
