import SubskillButtons from '@/components/calculator/menus/subskill-buttons.vue'
import { mount } from '@vue/test-utils'
import { subskill } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'

const mockSubskills = [
  {
    subskill: subskill.BERRY_FINDING_S,
    level: 10
  },
  {
    subskill: subskill.INGREDIENT_FINDER_M,
    level: 25
  }
]

describe('SubskillButtons', () => {
  it('renders correctly with given props', () => {
    const wrapper = mount(SubskillButtons, {
      props: {
        pokemonLevel: 50,
        selectedSubskills: mockSubskills
      }
    })

    expect(wrapper.exists()).toBe(true)

    const subskillButtons = wrapper.findAll('.v-btn')
    expect(subskillButtons.length).toBe(5) // subskillLevels are [10, 25, 50, 75, 100]

    const firstButton = subskillButtons[0]
    expect(firstButton.exists()).toBe(true)
    expect(firstButton.text()).toBe('Berry Finding S')

    const lockedBadge = wrapper.find('.v-badge__badge')
    expect(lockedBadge.exists()).toBe(true)
    expect(lockedBadge.text()).toContain('Lv.10')
  })

  it('displays ??? for subskills not assigned', () => {
    const wrapper = mount(SubskillButtons, {
      props: {
        pokemonLevel: 50,
        selectedSubskills: mockSubskills
      }
    })

    const lastButton = wrapper.findAll('.v-btn')[4]
    expect(lastButton.exists()).toBe(true)
    expect(lastButton.text()).toBe('???')
  })

  it('computes rarityColor correctly', () => {
    const wrapper = mount(SubskillButtons, {
      props: {
        pokemonLevel: 50,
        selectedSubskills: mockSubskills
      }
    })

    const firstButton = wrapper.findAll('.v-btn')[0]

    expect(firstButton.classes()).toContain('bg-subskillGold')

    const secondButton = wrapper.findAll('.v-btn')[1]
    expect(secondButton.classes()).toContain('bg-subskillSilver')
  })

  it('locks subskills correctly based on pokemon level', () => {
    const wrapper = mount(SubskillButtons, {
      props: {
        pokemonLevel: 20,
        selectedSubskills: mockSubskills
      }
    })

    const lockedBadge = wrapper.findAllComponents('.v-badge__badge')
    expect(lockedBadge[1].exists()).toBe(true)
    expect(lockedBadge[1].text()).toContain('Lv.25')
  })

  it('toggles subskill menu on button click', async () => {
    const wrapper = mount(SubskillButtons, {
      props: {
        pokemonLevel: 50,
        selectedSubskills: mockSubskills
      }
    })

    const button = wrapper.findAll('.v-btn')[0]
    await button.trigger('click')
    expect(wrapper.vm.subskillMenu).toBe(true)

    const dialog = document.querySelector('#subskillDialog')
    expect(dialog).not.toBeNull()
  })

  it('emits update-subskills event correctly', async () => {
    const wrapper = mount(SubskillButtons, {
      props: {
        pokemonLevel: 50,
        selectedSubskills: mockSubskills
      }
    })

    const updatedSubskills = [
      ...mockSubskills,
      {
        subskill: subskill.BERRY_FINDING_S,
        level: 50
      }
    ]

    wrapper.vm.updateSubskills(updatedSubskills)
    expect(wrapper.emitted('update-subskills')).toBeTruthy()
    expect(wrapper.emitted('update-subskills')![0]).toEqual([updatedSubskills])
  })
})
