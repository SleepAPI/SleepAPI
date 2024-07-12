import CustomLabel from '@/components/custom-components/custom-label.vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

describe('CustomLabel', () => {
  it('renders correctly with given label and badge', () => {
    const wrapper = mount(CustomLabel, {
      props: {
        label: 'Test Label',
        badge: 'Test Badge'
      }
    })

    expect(wrapper.exists()).toBe(true)
    const labelText = wrapper.find('.v-container')
    expect(labelText.exists()).toBe(true)
    expect(labelText.text()).toBe('Test Label')

    const badge = wrapper.find('.v-badge__badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('Test Badge')
  })

  it('has the correct styles and classes', () => {
    const wrapper = mount(CustomLabel, {
      props: {
        label: 'Styled Label'
      }
    })

    const card = wrapper.find('.v-card')
    expect(card.exists()).toBe(true)
    expect(card.classes()).toContain('d-flex')
    expect(card.classes()).toContain('fill-height')
    expect(card.classes()).toContain('w-100')

    const divider = wrapper.find('.v-divider')
    expect(divider.exists()).toBe(true)
    expect(divider.classes()).toContain('v-divider--vertical')
    expect(divider.classes()).toContain('ps-2')
    expect(divider.classes()).toContain('border-opacity-100')

    const span = wrapper.find('span')
    expect(span.exists()).toBe(true)
    expect(span.text()).toBe('Styled Label')
    expect(span.classes()).toContain('d-flex')
    expect(span.classes()).toContain('w-100')
    expect(span.classes()).toContain('align-center')
    expect(span.classes()).toContain('justify-center')
    expect(span.classes()).toContain('text-center')
    expect(span.attributes('style')).toContain('font-size: small')
  })
})
