import SubskillButton from '@/components/calculator/pokemon-input/subskill-button.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
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

  it('renders correctly', () => {
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('???')
  })

  it('displays the correct color based on rarity', async () => {
    wrapper.setData({ name: 'GoldSubskill' })
    const subskill = {
      name: 'GoldSubskill',
      rarity: 'gold'
    }
    wrapper.setData({ subskills: [subskill] })
    await nextTick()

    const button = wrapper.find('button')
    expect(button.text()).toBe('GoldSubskill')
    expect(button.classes()).toContain('bg-subskillGold')
  })

  it('opens subskill menu on button click', async () => {
    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.vm.subskillMenu).toBe(true)
    const editTeamNameDialog = document.querySelector('#subskillDialog')
    expect(editTeamNameDialog).not.toBeNull()
  })

  it('selects subskill correctly', async () => {
    const subskill = { name: 'GoldSubskill', rarity: 'gold' }
    wrapper.setData({ subskills: [subskill] })

    wrapper.vm.selectSubskill('GoldSubskill')
    expect(wrapper.vm.name).toBe('GoldSubskill')
    expect(wrapper.vm.subskillMenu).toBe(false)
    expect(wrapper.emitted('update-subskill')).toBeTruthy()
    expect(wrapper.emitted('update-subskill')![0]).toEqual([
      { subskill, subskillLevel: subskillProps.subskillLevel }
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
})
