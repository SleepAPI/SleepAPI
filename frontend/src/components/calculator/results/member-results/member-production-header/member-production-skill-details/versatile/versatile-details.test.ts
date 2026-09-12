import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import type { MemberWithProduction } from '@/types/member/instanced'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { commonMocks, Versatile } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember: MemberWithProduction = mocks.createMockMemberWithProduction({
  member: mocks.createMockPokemon({ pokemon: commonMocks.mockPokemon({ skill: Versatile }) })
})

describe('VersatileDetails', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionSkill>>

  beforeEach(async () => {
    wrapper = mount(MemberProductionSkill, {
      props: {
        memberWithProduction: mockMember
      }
    })
    await flushPromises()
    await vi.dynamicImportSettled()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with the provided member data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct skill level', () => {
    const skillLevelBadge = wrapper.find('#skillLevelBadge')
    expect(skillLevelBadge.text()).toBe('Lv.1')
  })

  it('renders the correct skill image', () => {
    const skillImage = wrapper.find('img')
    expect(skillImage.exists()).toBe(true)
    expect(skillImage.attributes('src')).toContain('/images/mainskill/versatile.png')
  })

  it('does not display a fabricated proc count', () => {
    expect(wrapper.find('img[alt="skill activations"]').exists()).toBe(false)
  })

  it('displays unknown candy amount instead of a fabricated number', () => {
    const candyImage = wrapper.find('img[alt="candy"]')
    expect(candyImage.exists()).toBe(true)
    expect(wrapper.text()).toContain('unknown')
  })

  it('explains that the skill is not yet implemented due to unknown proc rates', () => {
    const note = wrapper.find('.versatile-note')
    expect(note.exists()).toBe(true)
    expect(note.text()).toContain('Proc rates are unknown')
    expect(note.text()).toContain('not yet implemented')
  })
})
