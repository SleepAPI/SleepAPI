import SubskillButton from '@/components/pokemon-input/menus/subskill-button.vue'
import { mount } from '@vue/test-utils'
import { subskill, type SubskillInstanceExt } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

const mockSubskill = subskill.BERRY_FINDING_S

const selectedSubskills: SubskillInstanceExt[] = [
  {
    subskill: mockSubskill,
    level: 10
  }
]

describe('SubskillButton', () => {
  it('renders correctly with given props', () => {
    const wrapper = mount(SubskillButton, {
      props: {
        subskill: mockSubskill,
        selectedSubskills
      }
    })

    expect(wrapper.exists()).toBe(true)
    const button = wrapper.find('.v-btn')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe(mockSubskill.name)

    const badge = wrapper.find('.v-badge__badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('10')
  })

  it('renders custom label when provided', () => {
    const wrapper = mount(SubskillButton, {
      props: {
        subskill: mockSubskill,
        selectedSubskills,
        label: 'Custom Label'
      }
    })

    const button = wrapper.find('.v-btn')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Custom Label')
  })

  it('computes level correctly when subskill is selected', () => {
    const wrapper = mount(SubskillButton, {
      props: {
        subskill: mockSubskill,
        selectedSubskills
      }
    })

    expect(wrapper.vm.level).toBe(10)
  })

  it('computes level as undefined when subskill is not selected', () => {
    const wrapper = mount(SubskillButton, {
      props: {
        subskill: subskill.HELPING_BONUS,
        selectedSubskills
      }
    })

    expect(wrapper.vm.level).toBeUndefined()

    const badge = wrapper.find('.v-badge__badge')
    expect(badge.exists()).toBe(true)
    expect(badge.attributes('style')).toContain('display: none')
  })
})
