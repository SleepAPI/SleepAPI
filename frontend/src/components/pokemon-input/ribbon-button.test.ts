import RibbonButton from '@/components/pokemon-input/ribbon-button.vue'
import { VueWrapper, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('RibbonButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof RibbonButton>>

  beforeEach(() => {
    wrapper = mount(RibbonButton, {
      ribbon: 0
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with given props', async () => {
    await wrapper.setProps({ ribbon: 2 })
    await nextTick()

    expect(wrapper.exists()).toBe(true)
    const avatarImg = wrapper.find('img')
    expect(avatarImg.attributes('src')).toMatchInlineSnapshot(`"/images/misc/ribbon2.png"`)
    expect(avatarImg.classes()).not.toContain('greyScale')
  })

  it('renders the correct badge label based on the ribbon prop', async () => {
    await wrapper.setProps({ ribbon: 0 })
    await nextTick()

    const img = wrapper.find('img')
    expect(img.attributes('src')).toMatchInlineSnapshot(`"/images/misc/ribbon1.png"`)
    const avatarImg = wrapper.find('.v-img')
    expect(avatarImg.classes()).toContain('greyScale')
  })

  it('opens the menu when button is clicked', async () => {
    await wrapper.setProps({ ribbon: 1 })
    await nextTick()

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.vm.menu).toBe(true)
    const menuContainer = document.querySelectorAll('#ribbonMenu')
    expect(menuContainer[0]).not.toBeNull()
  })

  it('updates ribbon and emits update-ribbon event when list item is clicked', async () => {
    await wrapper.setProps({ ribbon: 1 })
    await nextTick()

    const button = wrapper.find('button')
    await button.trigger('click')

    await nextTick()

    const listItems = document.querySelectorAll('.v-list-item')
    const listItem = listItems[3]
    expect(listItem).not.toBeNull()
    ;(listItem as HTMLElement).click()

    await nextTick()

    expect(wrapper.emitted('update-ribbon')).toBeTruthy()
    expect(wrapper.emitted('update-ribbon')![0]).toEqual([3])

    expect(wrapper.vm.menu).toBe(false)
  })
})
