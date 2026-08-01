import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { timeWindowFactor } from '@/types/time/time-window'
import { mocks } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { CRESSELIA, MathUtils, compactNumber } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'
import LunarBlessingEnergyForEveryoneDetails from './lunar-blessing-energy-for-everyone-s-details.vue'

const mockMember = mocks.createMockMemberWithProduction({
  member: mocks.createMockPokemon({ pokemon: CRESSELIA, skillLevel: 6, externalId: 'mockExternalId' })
})

describe('LunarBlessingEnergyForEveryoneDetails', () => {
  let wrapper: VueWrapper<InstanceType<typeof LunarBlessingEnergyForEveryoneDetails>>
  let teamStore: ReturnType<typeof useTeamStore>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  beforeEach(async () => {
    setActivePinia(createPinia())
    teamStore = useTeamStore()
    pokemonStore = usePokemonStore()
    teamStore.teams = createMockTeams(1, { members: [mockMember.member.externalId] })
    pokemonStore.pokemon = { mockExternalId: mockMember.member }

    wrapper = mount(LunarBlessingEnergyForEveryoneDetails, {
      props: {
        memberWithProduction: mockMember
      }
    })
  })

  it('renders correctly with the provided member data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct skill level', () => {
    const skillLevelBadge = wrapper.find('#skillLevelBadge')
    expect(skillLevelBadge.text()).toBe('Lv.6')
  })

  it('renders the correct skill image', () => {
    const skillImage = wrapper.find('img')
    expect(skillImage.exists()).toBe(true)
    expect(skillImage.attributes('src')).toContain('/images/mainskill/energy.png')
  })

  it('displays the correct number of skill procs', () => {
    const skillProcs = wrapper.find('.font-weight-medium.text-center')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.production.skillProcs * timeWindowFactor('24H'), 1).toString()
    )
  })

  it('displays the correct total energy value', () => {
    const totalEnergyValue = wrapper.find('.font-weight-medium.text-no-wrap.text-center.ml-1')
    const expectedValue = MathUtils.round(mockMember.production.skillAmount * timeWindowFactor('24H'), 1)
    expect(totalEnergyValue.text()).toContain(compactNumber(expectedValue))
  })

  it('displays the correct self berry energy value', () => {
    const selfBerryValue = wrapper.find('.flex-center:nth-child(2) .font-weight-medium.text-no-wrap.text-center.ml-2')
    const berryAmount =
      mockMember.production.produceFromSkill.berries.find(
        (b) => b.berry.name === mockMember.member.pokemon.berry.name && b.level === mockMember.member.level
      )?.amount ?? 0
    const expectedValue = MathUtils.round(berryAmount * timeWindowFactor('24H'), 1)
    expect(selfBerryValue.text()).toContain(compactNumber(expectedValue))
  })

  it('displays the correct team berry energy value', () => {
    const teamBerryValue = wrapper.find('.flex-center:nth-child(3) .font-weight-medium.text-no-wrap.text-center.ml-2')
    const teamAmount = mockMember.production.produceFromSkill.berries.reduce(
      (sum, cur) =>
        sum +
        (cur.berry.name !== mockMember.member.pokemon.berry.name || cur.level !== mockMember.member.level
          ? cur.amount
          : 0),
      0
    )
    const expectedValue = MathUtils.round(teamAmount * timeWindowFactor('24H'), 1)
    expect(teamBerryValue.text()).toContain(compactNumber(expectedValue))
  })
})
