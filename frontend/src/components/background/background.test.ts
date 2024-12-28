import TheBackground from '@/components/background/background.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('TheBackground', () => {
  let wrapper: VueWrapper<InstanceType<typeof TheBackground>>

  beforeEach(() => {
    wrapper = mount(TheBackground)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders the background with correct attributes and styles', async () => {
    const img = wrapper.find('img')

    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/images/site/background.png')
  })
})
