import SneaselHomeIcon from '@/components/icons/sneasel-home-icon.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('SneaselHomeIcon', () => {
  it('renders correctly', () => {
    const wrapper = mount(SneaselHomeIcon)

    expect(wrapper.html()).toMatchInlineSnapshot(
      `"<div class="circle"><img src="/cook.png" alt="Sleep API icon"></div>"`
    )
  })

  it('contains a div with the class circle', () => {
    const wrapper = mount(SneaselHomeIcon)
    const circleDiv = wrapper.find('.circle')

    expect(circleDiv.exists()).toBe(true)
  })

  it('contains an img element with the correct attributes', () => {
    const wrapper = mount(SneaselHomeIcon)
    const img = wrapper.find('img')

    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/cook.png')
    expect(img.attributes('alt')).toBe('Sleep API icon')
  })
})
