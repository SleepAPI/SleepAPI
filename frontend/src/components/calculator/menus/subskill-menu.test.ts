import SubskillMenu from '@/components/calculator/menus/subskill-menu.vue'
import { mount } from '@vue/test-utils'
import { subskill, type SubskillInstanceExt } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

const mockCurrentSubskills: SubskillInstanceExt[] = [
  {
    subskill: subskill.BERRY_FINDING_S,
    level: 10
  },
  {
    subskill: subskill.HELPING_BONUS,
    level: 25
  }
]

describe('SubskillMenu', () => {
  it('renders correctly with given props', async () => {
    const wrapper = mount(SubskillMenu, {
      props: {
        currentSubskills: mockCurrentSubskills,
        availableSubskills: subskill
      }
    })

    expect(wrapper.exists()).toBe(true)

    await nextTick()

    const customLabels = wrapper.findAllComponents({ name: 'CustomLabel' })
    expect(customLabels.length).toBeGreaterThan(0)
    expect(customLabels[0].props('label')).toBe('Choose the level 50 subskill')

    const subskillButtons = wrapper.findAllComponents({ name: 'SubskillButton' })
    expect(subskillButtons.length).toBe(subskill.SUBSKILLS.length)
  })

  it('displays correct labels based on available subskills', async () => {
    const wrapper = mount(SubskillMenu, {
      props: {
        currentSubskills: mockCurrentSubskills,
        availableSubskills: subskill
      }
    })

    await nextTick()

    const customLabels = wrapper.findAllComponents({ name: 'CustomLabel' })
    expect(customLabels[0].props('label')).toBe('Choose the level 50 subskill')
  })

  it('computes lowest available level correctly', () => {
    const wrapper = mount(SubskillMenu, {
      props: {
        currentSubskills: mockCurrentSubskills,
        availableSubskills: subskill
      }
    })

    expect(wrapper.vm.lowestAvailableLevel).toBe(50)
  })

  it('toggles subskill selection correctly', async () => {
    const wrapper = mount(SubskillMenu, {
      props: {
        currentSubskills: mockCurrentSubskills,
        availableSubskills: subskill
      }
    })

    await nextTick()

    const subskillButton = wrapper.findAllComponents({ name: 'SubskillButton' })[2]
    await subskillButton.trigger('click')

    expect(wrapper.vm.selectedSubskills).toContainEqual({
      level: 50,
      subskill: subskill.ENERGY_RECOVERY_BONUS
    })
  })

  it('emits cancel event correctly', async () => {
    const wrapper = mount(SubskillMenu, {
      props: {
        currentSubskills: mockCurrentSubskills,
        availableSubskills: subskill
      }
    })

    await nextTick()

    const cancelButton = wrapper.find('[data-testid="cancel-button"]')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('emits update-subskills event correctly', async () => {
    const wrapper = mount(SubskillMenu, {
      props: {
        currentSubskills: mockCurrentSubskills,
        availableSubskills: subskill
      }
    })

    await nextTick()

    const saveButton = wrapper.find('[data-testid="save-button"]')
    await saveButton.trigger('click')

    expect(wrapper.emitted('update-subskills')).toBeTruthy()
    expect(wrapper.emitted('update-subskills')![0]).toEqual([wrapper.vm.selectedSubskills])
  })

  it('clears selected subskills correctly', async () => {
    const wrapper = mount(SubskillMenu, {
      props: {
        currentSubskills: mockCurrentSubskills,
        availableSubskills: subskill
      }
    })

    await nextTick()

    const clearButton = wrapper.find('[data-testid="clear-button"]')
    await clearButton.trigger('click')

    expect(wrapper.vm.selectedSubskills.length).toBe(0)
  })
})
