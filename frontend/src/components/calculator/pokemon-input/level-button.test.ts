import LevelButton from '@/components/calculator/pokemon-input/level-button.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

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

  it('renders correctly with default data', () => {
    expect(wrapper.text()).toContain('Level 50')
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
    const listItems = wrapper.findAllComponents({ name: 'v-list-item' })
    await listItems[0].trigger('click')

    expect(wrapper.emitted('update-level')).toBeTruthy()
    expect(wrapper.emitted('update-level')![0]).toEqual([10])
  })

  it('updates level when a custom value is entered and saved', async () => {
    await wrapper.setData({ menu: true })
    const customInput = wrapper.findComponent({ name: 'v-text-field' })
    await customInput.setValue(75)
    await customInput.trigger('keydown.enter')

    expect(wrapper.emitted('update-level')).toBeTruthy()
    expect(wrapper.emitted('update-level')![0]).toEqual([75])
  })

  it('closes the menu when a value is selected', async () => {
    await wrapper.setData({ menu: true })
    const listItems = wrapper.findAllComponents({ name: 'v-list-item' })
    await listItems[1].trigger('click')

    expect(wrapper.vm.$data.menu).toBe(false)
  })

  it('does not emit update-level for invalid custom values', async () => {
    await wrapper.setData({ menu: true })
    const customInput = wrapper.findComponent({ name: 'v-text-field' })
    await customInput.setValue(105)
    await customInput.trigger('keydown.enter')

    expect(wrapper.emitted('update-level')).toBeFalsy()
  })
})
