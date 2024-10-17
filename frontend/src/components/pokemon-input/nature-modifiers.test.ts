import NatureModifiers from '@/components/pokemon-input/nature-modifiers.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { nature } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('NatureModifiers', () => {
  let wrapper: VueWrapper<InstanceType<typeof NatureModifiers>>

  beforeEach(() => {
    wrapper = mount(NatureModifiers, {
      props: {
        nature: nature.BASHFUL,
        short: false
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders the correct positive nature modifier', async () => {
    await wrapper.setProps({
      nature: nature.ADAMANT
    })

    const positiveStatSpan = wrapper.find('.nowrap span')
    expect(positiveStatSpan.text()).toBe('Speed of help')

    const positiveIcons = wrapper.findAll('i.text-primary.mdi-triangle')
    expect(positiveIcons.length).toBe(2)
  })

  it('renders the correct negative nature modifier', async () => {
    await wrapper.setProps({
      nature: nature.ADAMANT
    })

    const negativeStatSpan = wrapper.findAll('.nowrap span').at(1)
    expect(negativeStatSpan?.text()).toBe('Ingredient finding')

    const negativeIcons = wrapper.findAll('i.text-surface.mdi-triangle-down')
    expect(negativeIcons.length).toBe(2)
  })

  it('renders the correct shortened stat messages when short prop is true', async () => {
    await wrapper.setProps({
      nature: nature.ADAMANT,
      short: true
    })

    const positiveStatSpan = wrapper.find('.nowrap span')
    expect(positiveStatSpan.text()).toBe('Speed')

    const negativeStatSpan = wrapper.findAll('.nowrap span').at(1)
    expect(negativeStatSpan?.text()).toBe('Ing')
  })

  it('renders "no effect" when no modifier is greater or lesser than 1', async () => {
    await wrapper.setProps({
      nature: nature.BASHFUL
    })

    const positiveStatSpan = wrapper.find('.nowrap span')
    expect(positiveStatSpan.text()).toBe('This nature has no effect')
  })
})
