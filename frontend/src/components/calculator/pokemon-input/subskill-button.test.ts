import SubskillButton from '@/components/calculator/pokemon-input/subskill-button.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { subskill } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('SubskillButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof SubskillButton>>

  const subskillProps = {
    subskillLevel: 5,
    pokemonLevel: 10,
    selectedSubskills: []
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(SubskillButton, {
      props: subskillProps
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders with default values', () => {
    const button = wrapper.find('button')

    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('???')
    expect(wrapper.vm.subskillMenu).toBe(false)
    expect(wrapper.vm.subskillOptions).toEqual(subskill.SUBSKILLS)
  })

  it('handles empty selectedSubskills array', async () => {
    await wrapper.setProps({ selectedSubskills: [] })
    expect(wrapper.vm.thisSubskill).toBeUndefined()
    expect(wrapper.vm.subskillName).toBe('???')
  })

  it('displays the correct color based on rarity', async () => {
    wrapper.setProps({ selectedSubskills: [{ level: 5, subskill: subskill.HELPING_BONUS }] })
    await nextTick()

    const button = wrapper.find('button')
    expect(button.text()).toBe(subskill.HELPING_BONUS.name)
    expect(button.classes()).toContain('bg-subskillGold')
    expect(wrapper.vm.rarityColor).toBe('subskillGold')
  })

  it('opens subskill menu on button click', async () => {
    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.vm.subskillMenu).toBe(true)
    const editTeamNameDialog = document.querySelector('#subskillDialog')
    expect(editTeamNameDialog).not.toBeNull()
  })

  it('should update subskill name label automatically when new subskill selected matching subskillLevel', async () => {
    wrapper.setProps({ selectedSubskills: [{ level: 5, subskill: subskill.HELPING_BONUS }] })
    await nextTick()

    expect(wrapper.vm.subskillName).toEqual(subskill.HELPING_BONUS.name)
  })

  it('selects subskill correctly', async () => {
    wrapper.vm.selectSubskill(subskill.HELPING_BONUS.name)

    expect(wrapper.emitted('update-subskill')).toHaveLength(1)
    expect(wrapper.emitted('update-subskill')![0]).toEqual([
      {
        subskill: subskill.HELPING_BONUS,
        subskillLevel: subskillProps.subskillLevel
      }
    ])
  })

  it('shows lock icon when subskill is locked', async () => {
    await wrapper.setProps({ pokemonLevel: 3, subskillLevel: 10 })

    const badge = wrapper.findComponent({ name: 'v-badge' })
    expect(badge.exists()).toBe(true)

    const lockIcon = badge.find('i.mdi-lock')
    expect(lockIcon.exists()).toBe(true)
    expect(lockIcon.classes()).toContain('mdi-lock')

    const badgeText = badge.find('.v-badge__badge')
    expect(badgeText.exists()).toBe(true)
    expect(badgeText.text()).toBe('Lv.10')
  })

  it('filters subskills correctly', () => {
    const filteredSubskills = wrapper.vm.filteredSubskills
    expect(filteredSubskills).toMatchSnapshot()
  })
})
