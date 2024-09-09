import StackedBar from '@/components/custom-components/stacked-bar.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

describe('StackedBar', () => {
  let wrapper: VueWrapper<InstanceType<typeof StackedBar>>

  const sections = [
    { percentage: 30, color: 'red' },
    { percentage: 50, color: 'blue' },
    { percentage: 20, color: 'green' }
  ]

  beforeEach(() => {
    wrapper = mount(StackedBar, {
      props: {
        sections
      }
    })
  })

  it('renders the correct number of sections', () => {
    const sectionDivs = wrapper.findAll('.stacked-bar-section')
    expect(sectionDivs.length).toBe(sections.length)
  })

  it('renders each section with the correct width and color', () => {
    const sectionDivs = wrapper.findAll('.stacked-bar-section')

    sectionDivs.forEach((div, index) => {
      const expectedWidth = `${sections[index].percentage}%`
      expect(div.attributes('style')).toContain(`width: ${expectedWidth}`)

      expect(div.classes()).toContain(`bg-${sections[index].color}`)
      expect(div.text()).toBe(`${sections[index].percentage}%`)
    })
  })
})
