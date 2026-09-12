import MemberProductionBerry from '@/components/calculator/results/member-results/member-production-header/member-production-berry.vue'
import { berryImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { mocks } from '@/vitest'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { GENGAR, MathUtils, berry, compactNumber } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const baseProduction = mocks.createMockMemberWithProduction().production
const mockMember = mocks.createMockMemberWithProduction({
  member: mocks.createMockPokemon({ pokemon: GENGAR }),
  production: {
    ...baseProduction,
    produceWithoutSkill: {
      berries: [{ amount: 20, berry: berry.BLUK, level: 1 }],
      ingredients: []
    },
    strength: {
      ...baseProduction.strength,
      berries: {
        total: 250,
        breakdown: {
          base: 200,
          favored: 30,
          islandBonus: 20
        }
      }
    }
  }
})

describe('MemberProductionBerry', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionBerry>>

  beforeEach(() => {
    wrapper = mount(MemberProductionBerry, {
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

  it('displays the correct berry image', () => {
    const berryImg = wrapper.find('img')
    expect(berryImg.attributes('src')).toBe(berryImage(mockMember.production.produceWithoutSkill.berries[0].berry))
  })

  it('displays the correct berry amount', () => {
    const amountSpan = wrapper.find('span.font-weight-medium')
    const timeWindowFactor = useTeamStore().timeWindowFactor
    expect(amountSpan.text()).toBe(
      `x${MathUtils.round(mockMember.production.produceWithoutSkill.berries[0].amount * timeWindowFactor, 1)}`
    )
  })

  it('displays the correct berry strength', () => {
    const strengthSpan = wrapper.findAll('span.font-weight-medium').at(1)
    const teamStore = useTeamStore()
    const currentBerryStrength = compactNumber(
      mockMember.production.strength.berries.total * teamStore.timeWindowFactor
    )
    expect(strengthSpan?.text()).toBe(`${currentBerryStrength}`)
  })
})
