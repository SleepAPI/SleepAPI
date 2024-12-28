import LevelButton from '@/components/pokemon-input/level-button.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('LevelButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof LevelButton>>

  beforeEach(() => {
    wrapper = mount(LevelButton, {
      props: {
        level: 50
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('displays default values correctly in the list', async () => {
    await wrapper.setData({ menu: true })
    const listItems = wrapper.findAllComponents({ name: 'v-list-item' })
    const expectedValues = [10, 25, 30, 50, 60]
    listItems.forEach((item, index) => {
      expect(item.text()).toBe(expectedValues[index].toString())
    })
  })

  it('updates level when a default value is selected', async () => {
    await wrapper.setData({ menu: true })
    const listItems = wrapper.findAllComponents({ name: 'v-btn' })
    await listItems[0].trigger('click')

    // should emit on mount and update to 10
    expect(wrapper.emitted('update-level')).toHaveLength(2)
    expect(wrapper.emitted('update-level')![0]).toEqual([50])
    expect(wrapper.emitted('update-level')![1]).toEqual([25])
  })

  it('updates level when a custom value is entered and saved', async () => {
    await wrapper.setData({ menu: true })
    const customInput = wrapper.findComponent({ name: 'v-text-field' })
    await customInput.setValue(75)
    await customInput.trigger('keydown.enter')

    // should emit on mount and update to 75
    expect(wrapper.emitted('update-level')).toHaveLength(2)
    expect(wrapper.emitted('update-level')![0]).toEqual([50])
    expect(wrapper.emitted('update-level')![1]).toEqual([75])
  })

  it('does not emit update-level for invalid custom values', async () => {
    await wrapper.setData({ menu: true })
    await wrapper.setProps({ level: 50 })
    await nextTick()

    const customInput = wrapper.findComponent({ name: 'v-text-field' })
    await customInput.setValue(105)
    await customInput.trigger('keydown.enter')

    // should emit on mount, but not the 105
    expect(wrapper.emitted('update-level')).toHaveLength(1)
    expect(wrapper.emitted('update-level')![0]).toEqual([50])
  })
})
