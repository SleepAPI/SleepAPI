import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-skill.vue'
import { StrengthService } from '@/services/strength/strength-service'
import { createMockPokemon } from '@/vitest'
import { createMockMemberInstanceProduction } from '@/vitest/mocks/calculator/member-instance-production'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { MathUtils, compactNumber, pokemon } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = createMockMemberInstanceProduction({
  pokemonInstance: createMockPokemon({ pokemon: pokemon.RAICHU })
})

describe('MemberProductionSkill', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionSkill>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(MemberProductionSkill, {
      props: {
        member: mockMember
      }
    })
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
    expect(skillImage.attributes('src')).toContain('/images/mainskill/strength.png')
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.font-weight-medium.text-center')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.skillProcs * StrengthService.timeWindowFactor('24H'), 1).toString()
    )
  })

  it('displays the correct skill value per proc', () => {
    const skillValuePerProc = wrapper.find('.font-weight-light.text-body-2')
    expect(skillValuePerProc.text()).toBe(
      `x${mockMember.pokemonInstance.pokemon.skill.amount(mockMember.pokemonInstance.skillLevel)}`
    )
  })

  it('displays the correct total skill value', () => {
    const totalSkillValue = wrapper.find('.font-weight-medium.text-no-wrap.text-center.ml-1')
    const expectedValue = StrengthService.skillValue({
      skill: mockMember.pokemonInstance.pokemon.skill,
      amount: mockMember.skillAmount,
      timeWindow: '24H'
    })
    expect(totalSkillValue.text()).toContain(compactNumber(expectedValue))
  })
})
