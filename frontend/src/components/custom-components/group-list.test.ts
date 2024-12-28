import GroupList, { type GroupData } from '@/components/custom-components/group-list.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
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

  it('filters groups based on search query', async () => {
    const searchInput = wrapper.findComponent({ name: 'v-text-field' })
    await searchInput.setValue('Option 2.1')

    const listGroups = wrapper.findAllComponents({ name: 'v-list-group' })
    expect(listGroups.length).toBe(1) // Only one group should match the search query

    const listItems = listGroups[0].findAllComponents({ name: 'v-list-item' }).slice(1)
    expect(listItems.length).toBe(1) // Only one item should match the search query
    expect(listItems[0].props('title')).toBe('Option 2.1')
  })

  it('opens all groups when there is a search query', async () => {
    const searchInput = wrapper.findComponent({ name: 'v-text-field' })
    await searchInput.setValue('Option')

    const listGroups = wrapper.findAllComponents({ name: 'v-list-group' })
    listGroups.forEach((group) => {
      expect(group.props('value')).toBeTruthy()
    })
  })

  it('closes all groups when the search query is cleared', async () => {
    const searchInput = wrapper.findComponent({ name: 'v-text-field' })
    await searchInput.setValue('Option')
    await searchInput.setValue('')

    const openedGroups = wrapper.vm.openedGroups
    expect(openedGroups.length).toBe(0)

    const listGroups = wrapper.findAllComponents({ name: 'v-list-group' })
    listGroups.forEach((group) => {
      expect(openedGroups).not.toContain(group.props('value'))
    })
  })
})
