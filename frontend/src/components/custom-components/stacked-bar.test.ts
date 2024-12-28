import StackedBar, { type Section } from '@/components/custom-components/stacked-bar.vue'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

describe('StackedBar', () => {
  let wrapper: VueWrapper<InstanceType<typeof StackedBar>>

  const sections: Section[] = [
    { percentage: 30, color: 'red', sectionText: 'red', tooltipText: 'red' },
    { percentage: 50, color: 'blue', sectionText: 'blue', tooltipText: 'blue' },
    { percentage: 20, color: 'green', sectionText: 'green', tooltipText: 'green' }
  ]

  beforeEach(() => {
    wrapper = mount(StackedBar, {
      props: {
        sections
      }
    })
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
