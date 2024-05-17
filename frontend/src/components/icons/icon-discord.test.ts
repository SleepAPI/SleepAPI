import DiscordIcon from '@/components/icons/icon-discord.vue' // Adjust the import path as necessary
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('DiscordIcon', () => {
  it('renders the SVG correctly', () => {
    const wrapper = mount(DiscordIcon)

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)

    expect(svg.attributes('width')).toBe('24')
    expect(svg.attributes('height')).toBe('24')
    expect(svg.attributes('fill')).toBe('currentColor')

    const path = svg.find('path')
    expect(path.exists()).toBe(true)
  })
})
