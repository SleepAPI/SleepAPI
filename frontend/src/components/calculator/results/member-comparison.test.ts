import MemberComparison from '@/components/calculator/results/member-comparison.vue'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('MemberComparison', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberComparison>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(MemberComparison)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
  })
})
