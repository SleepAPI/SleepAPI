import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import { timeWindowFactor } from '@/types/time/time-window'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { MathUtils, PERSIAN, compactNumber } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = mocks.createMockMemberProductionExt({
  member: mocks.createMockPokemon({ pokemon: PERSIAN })
})

describe('MemberProductionSkill', () => {
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
    expect(skillImage.attributes('src')).toContain('/images/mainskill/shards.png')
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.font-weight-medium.text-center')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.production.skillProcs * timeWindowFactor('24H'), 1).toString()
    )
  })

  it('displays the correct total skill value', () => {
    const totalSkillValue = wrapper.find('.font-weight-medium.text-no-wrap.text-center.ml-1')
    const expectedValue = MathUtils.round(mockMember.production.skillAmount * timeWindowFactor('24H'), 1)
    expect(totalSkillValue.text()).toContain(compactNumber(expectedValue))
  })
})
