import NatureMenu from '@/components/pokemon-input/menus/nature-menu.vue'
import { mount } from '@vue/test-utils'
import { nature } from 'sleepapi-common'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('NatureMenu', () => {
  it('renders correctly', () => {
    const wrapper = mount(NatureMenu)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct initial text', () => {
    const wrapper = mount(NatureMenu)
    const customLabel = wrapper.findComponent({ name: 'CustomLabel' })
    expect(customLabel.exists()).toBe(true)
    expect(customLabel.text()).toContain('Click on a positive and negative modifier')
  })

  it('displays positive and negative modifier buttons correctly', () => {
    const wrapper = mount(NatureMenu)
    const buttons = wrapper
      .findAll('.bg-secondary')
      .filter(
        (btn) =>
          btn.text().includes('Speed of help') ||
          btn.text().includes('Ingredient') ||
          btn.text().includes('Skill chance') ||
          btn.text().includes('Energy') ||
          btn.text().includes('EXP')
      )

    expect(buttons.length).toBe(10)
  })

  it('sets positive modifier correctly when button is clicked', async () => {
    const wrapper = mount(NatureMenu)
    const positiveButton = wrapper.findAll('.bg-secondary').find((btn) => btn.text().includes('Speed of help'))
    await positiveButton!.trigger('click')
    expect(wrapper.vm.positiveModifier).toBe('speed')
  })

  it('sets negative modifier correctly when button is clicked', async () => {
    const wrapper = mount(NatureMenu)
    const negativeButton = wrapper.findAll('.bg-secondary').filter((btn) => btn.text().includes('Speed of help'))[1]

    await negativeButton.trigger('click')
    expect(wrapper.vm.negativeModifier).toBe('speed')
  })

  it('sets neutral nature correctly when Neutral button is clicked', async () => {
    const wrapper = mount(NatureMenu)
    const neutralButton = wrapper.findAll('button').find((btn) => btn.text() === 'Neutral')
    await neutralButton!.trigger('click')
    expect(wrapper.vm.selectedNature).toEqual(nature.BASHFUL)
  })

  it('filters natures correctly based on selected modifiers', async () => {
    const wrapper = mount(NatureMenu)
    wrapper.setData({ positiveModifier: 'speed', negativeModifier: 'energy' })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.filteredNatures.length).toBeGreaterThan(0)
  })

  it('toggles chip selection correctly', async () => {
    const wrapper = mount(NatureMenu)
    const natureChip = wrapper.findAllComponents({ name: 'v-chip' }).find((chip) => chip.text().includes('Adamant'))
    await natureChip!.trigger('click')
    expect(wrapper.vm.selectedNature).toBeDefined()
    expect(wrapper.vm.positiveModifier).toBe(wrapper.vm.selectedNature?.positiveModifier)
    expect(wrapper.vm.negativeModifier).toBe(wrapper.vm.selectedNature?.negativeModifier)
  })

  it('emits cancel event correctly', async () => {
    const wrapper = mount(NatureMenu)
    const cancelButton = wrapper.find('[data-testid="cancel-button"]')
    await cancelButton.trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('emits update-nature event correctly', async () => {
    const wrapper = mount(NatureMenu)

    wrapper.setData({ selectedNature: nature.ADAMANT })
    await nextTick()

    const saveButton = wrapper.find('[data-testid="save-button"]')
    expect(saveButton.exists()).toBe(true)

    await saveButton.trigger('click')

    expect(wrapper.emitted('update-nature')).toBeTruthy()
    expect(wrapper.emitted('update-nature')![0]).toEqual([nature.ADAMANT])
  })
})
