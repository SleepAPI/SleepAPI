import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import { timeWindowFactor } from '@/types/time/time-window'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import { CookingAssistSBulkUp, HERACROSS, MathUtils, compactNumber } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = mocks.createMockMemberWithProduction({
  member: mocks.createMockPokemon({ pokemon: HERACROSS })
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
    expect(skillImage.attributes('src')).toContain('/images/mainskill/ingredients.png')
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.font-weight-medium.text-center')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.production.skillProcs * timeWindowFactor('24H'), 1).toString()
    )
  })

  it('displays the correct ingredient and crit values per proc', () => {
    const textLines = wrapper.findAll('.font-weight-light.text-body-2')
    expect(textLines[0].text()).toBe(`x${CookingAssistSBulkUp.activations.ingredients.amount({ skillLevel: 1 })}`)
    expect(textLines[1].text()).toBe(`+${CookingAssistSBulkUp.activations.critChance.amount({ skillLevel: 1 })}%`)
  })

  it('displays the correct total ingredient and crit values', () => {
    const totalValues = wrapper.findAll('.font-weight-medium.text-no-wrap.text-center.ml-2')
    const expectedIngredientValue = mockMember.production.skillValue.ingredients.amountToSelf * timeWindowFactor('24H')
    const expectedCritValue = mockMember.production.skillValue['crit chance'].amountToSelf * timeWindowFactor('24H')

    expect(totalValues[0].text()).toContain(compactNumber(expectedIngredientValue))
    expect(totalValues[1].text()).toContain(`${compactNumber(expectedCritValue)}%`)
  })
})
