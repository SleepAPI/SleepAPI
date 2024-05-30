import GroupList, { type GroupData } from '@/components/custom-components/group-list.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('GroupList', () => {
  let wrapper: VueWrapper<InstanceType<typeof GroupList>>

  const groupData: GroupData[] = [
    {
      category: 'Category 1',
      list: ['Option 1.1', 'Option 1.2']
    },
    {
      category: 'Category 2',
      list: ['Option 2.1', 'Option 2.2']
    }
  ]

  beforeEach(() => {
    wrapper = mount(GroupList, {
      props: {
        data: groupData,
        selectedOptions: ['Option 1.1']
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with provided data', () => {
    const listGroups = wrapper.findAllComponents({ name: 'v-list-group' })
    expect(listGroups.length).toBe(groupData.length)

    groupData.forEach((group, index) => {
      expect(listGroups[index].props('value')).toBe(group.category)
      const listItems = listGroups[index].findAllComponents({ name: 'v-list-item' })
      expect(listItems.length).toBe(group.list.length + 1) // +1 for the group category item
    })
  })

  it('displays options correctly', () => {
    const listGroups = wrapper.findAllComponents({ name: 'v-list-group' })

    groupData.forEach((group, groupIndex) => {
      const listItems = listGroups[groupIndex].findAllComponents({ name: 'v-list-item' }).slice(1) // skip the category item
      group.list.forEach((option, optionIndex) => {
        expect(listItems[optionIndex].props('title')).toBe(option)
      })
    })
  })

  it('disables option when it is selected', () => {
    const listGroups = wrapper.findAllComponents({ name: 'v-list-group' })
    const firstGroupItems = listGroups[0].findAllComponents({ name: 'v-list-item' }).slice(1) // skip the category item
    expect(firstGroupItems[0].props('disabled')).toBe(true)
  })

  it('emits select-option event on option click', async () => {
    const listGroups = wrapper.findAllComponents({ name: 'v-list-group' })
    const firstGroupItems = listGroups[0].findAllComponents({ name: 'v-list-item' }).slice(1) // skip the category item

    await firstGroupItems[1].trigger('click')

    expect(wrapper.emitted('select-option')).toBeTruthy()
    expect(wrapper.emitted('select-option')![0]).toEqual(['Option 1.2'])
  })
})
