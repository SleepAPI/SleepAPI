import MemberProductionBerry from '@/components/calculator/results/member-results/member-production-berry.vue'
import { StrengthService } from '@/services/strength/strength-service'
import { berryImage } from '@/services/utils/image-utils'
import { useTeamStore } from '@/stores/team/team-store'
import { createMockPokemon } from '@/vitest'
import { createMockMemberInstanceProduction } from '@/vitest/mocks/calculator/member-instance-production'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { MathUtils, berry, pokemon } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = createMockMemberInstanceProduction({
  pokemonInstance: createMockPokemon({ pokemon: pokemon.GENGAR }),
  produceWithoutSkill: {
    berries: [{ amount: 20, berry: berry.BLUK, level: 1 }],
    ingredients: []
  }
})

describe('MemberProductionBerry', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionBerry>>

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(MemberProductionBerry, {
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

  it('displays the correct berry image', () => {
    const berryImg = wrapper.find('img')
    expect(berryImg.attributes('src')).toBe(
      berryImage(mockMember.produceWithoutSkill.berries[0].berry)
    )
  })

  it('displays the correct berry amount', () => {
    const amountSpan = wrapper.find('span.font-weight-medium')
    const timeWindowFactor = StrengthService.timeWindowFactor(useTeamStore().timeWindow)
    expect(amountSpan.text()).toBe(
      `x${MathUtils.round(mockMember.produceWithoutSkill.berries[0].amount * timeWindowFactor, 1)}`
    )
  })

  it('displays the correct berry strength', () => {
    const strengthSpan = wrapper.findAll('span.font-weight-medium').at(1)
    const teamStore = useTeamStore()
    const currentBerryStrength = StrengthService.berryStrength({
      favored: teamStore.getCurrentTeam.favoredBerries,
      berries: mockMember.produceWithoutSkill.berries,
      timeWindow: teamStore.timeWindow
    })
    expect(strengthSpan?.text()).toBe(`${currentBerryStrength}`)
  })
})
