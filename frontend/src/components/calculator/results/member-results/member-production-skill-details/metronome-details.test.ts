import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-skill.vue'
import { StrengthService } from '@/services/strength/strength-service'
import { createMockMemberProductionExt, createMockPokemon } from '@/vitest'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { MathUtils, pokemon } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = createMockMemberProductionExt({
  member: createMockPokemon({ pokemon: pokemon.TOGEKISS })
})

describe('MemberProductionSkill', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionSkill>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(MemberProductionSkill, {
      props: {
        memberWithProduction: mockMember
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
    expect(skillImage.attributes('src')).toContain('/images/mainskill/metronome.png')
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.font-weight-medium.text-center')
    expect(skillProcs.text()).toBe(
      MathUtils.round(
        mockMember.production.skillProcs * StrengthService.timeWindowFactor('24H'),
        1
      ).toString()
    )
  })

  it('displays the correct total skill value', () => {
    const info = wrapper.find('.font-weight-light.text-no-wrap.text-center')

    expect(info.text()).toContain('*more coming')
  })
})
