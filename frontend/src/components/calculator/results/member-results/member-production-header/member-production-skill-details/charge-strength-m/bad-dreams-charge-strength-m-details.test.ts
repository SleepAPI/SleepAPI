import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import type { MemberProductionExt } from '@/types/member/instanced'
import { timeWindowFactor } from '@/types/time/time-window'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { DARKRAI, MathUtils, compactNumber, type MemberSkillValue } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockMember: MemberProductionExt = mocks.createMockMemberProductionExt({
  member: mocks.createMockPokemon({ pokemon: DARKRAI })
})

const skillValue: MemberSkillValue = mockMember.production.skillValue
skillValue.strength = { amountToSelf: 100, amountToTeam: 0 }
skillValue.energy = { amountToSelf: 0, amountToTeam: -24 }

mockMember.production.skillProcs = 5
mockMember.production.skillAmount = 100
mockMember.production.skillValue = skillValue

describe('BadDreamsChargeStrengthMDetails', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionSkill>>

  beforeEach(async () => {
    vi.spyOn(console, 'debug').mockImplementation(() => {})

    setActivePinia(createPinia())
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
    vi.restoreAllMocks()
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
    expect(skillImage.attributes('src')).toContain('/images/mainskill/strength.png')
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.font-weight-medium.text-center')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.production.skillProcs * timeWindowFactor('24H'), 1).toString()
    )
  })

  it('displays the correct total skill value', () => {
    const totalSkillValue = wrapper.findAll('.font-weight-medium.text-no-wrap.text-center.ml-1').at(0)
    const expectedValue = Math.floor(mockMember.production.strength.skill.total * timeWindowFactor('24H'))
    expect(totalSkillValue?.text()).toContain(compactNumber(expectedValue))
  })

  it('displays the correct total energy degraded', () => {
    const totalEnergyDegraded = wrapper.find('.font-weight-medium.text-error-3.text-no-wrap.text-center.ml-1')
    expect(totalEnergyDegraded.text()).toContain('-24')
  })
})
