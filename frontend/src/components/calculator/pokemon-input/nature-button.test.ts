import NatureButton from '@/components/calculator/pokemon-input/nature-button.vue'
import { VueWrapper, mount } from '@vue/test-utils'
import { nature } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('NatureButton', () => {
  let wrapper: VueWrapper<InstanceType<typeof NatureButton>>
  const sampleNature = nature.BASHFUL

  beforeEach(() => {
    wrapper = mount(NatureButton, {
      props: {
        disabled: false
      },
      data() {
        return {
          nature: sampleNature
        }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders correctly with provided data', () => {
    expect(wrapper.find('.responsive-text').text()).toContain('Bashful')
  })

  it('computes natureName correctly when enabled', () => {
    expect(wrapper.vm.natureName).toBe(sampleNature.name)
  })

  it('computes filteredNatures correctly', () => {
    const filteredNatures = wrapper.vm.filteredNatures
    expect(filteredNatures).toBeDefined()
    expect(filteredNatures.length).toBeGreaterThan(0)
  })

  it('computes positiveStat correctly', () => {
    expect(wrapper.vm.positiveStat).toBe('This nature has no effect')
  })

  it('computes negativeStat correctly', () => {
    expect(wrapper.vm.negativeStat).toBe('This nature has no effect')
  })

  it('updates nature and emits update-nature event when selectNature is called', () => {
    const newNatureName = 'Brave'
    wrapper.vm.selectNature(newNatureName)
    expect(wrapper.vm.nature.name).toBe(newNatureName)
    const emitted = wrapper.emitted('update-nature') as Array<Array<nature.Nature>>
    expect(emitted).toHaveLength(1)

    const emittedEvent = emitted[0][0]
    expect(emittedEvent.name).toBe(newNatureName)
  })

  it('opens the dialog when the button is clicked', async () => {
    const button = wrapper.find('button')
    await button.trigger('click')
    expect(wrapper.vm.natureMenu).toBe(true)
    expect(wrapper.findComponent({ name: 'GroupList' }).exists()).toBe(true)
  })

  it('displays correct positive and negative stats for non-neutral nature', async () => {
    const customNature = { ...sampleNature, frequency: 2 }
    await wrapper.setData({ nature: customNature })
    expect(wrapper.vm.positiveStat).toBe('Speed of help')
    expect(wrapper.vm.negativeStat).toBe('This nature has no effect')
  })
})
