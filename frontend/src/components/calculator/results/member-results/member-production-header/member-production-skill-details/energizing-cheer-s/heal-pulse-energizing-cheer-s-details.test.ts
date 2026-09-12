import { useTeamStore } from '@/stores/team/team-store'
import { timeWindowFactor } from '@/types/time/time-window'
import { mocks } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import {
  EnergizingCheerSHealPulse,
  MathUtils,
  commonMocks,
  compactNumber,
  type MemberSkillValue
} from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'
import HealPulseEnergizingCheerSDetails from './heal-pulse-energizing-cheer-s-details.vue'

const mockMember = mocks.createMockMemberWithProduction({
  member: mocks.createMockPokemon({
    pokemon: commonMocks.mockPokemon({ skill: EnergizingCheerSHealPulse }),
    skillLevel: 6
  })
})

const skillValue: MemberSkillValue = mockMember.production.skillValue
skillValue.energy = { amountToSelf: 0, amountToTeam: 120 }
skillValue.helps = { amountToSelf: 0, amountToTeam: 45 }
mockMember.production.skillValue = skillValue

describe('HealPulseEnergizingCheerSDetails', () => {
  let wrapper: VueWrapper<InstanceType<typeof HealPulseEnergizingCheerSDetails>>
  let teamStore: ReturnType<typeof useTeamStore>

  beforeEach(async () => {
    setActivePinia(createPinia())
    teamStore = useTeamStore()
    teamStore.teams = createMockTeams(1, { members: [mockMember.member.externalId] })

    wrapper = mount(HealPulseEnergizingCheerSDetails, {
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
    const skillProcs = wrapper.find('.num-skill-procs')
    expect(skillProcs.text()).toBe(
      MathUtils.round(mockMember.production.skillProcs * timeWindowFactor('24H'), 1).toString()
    )
  })

  it('displays the correct energy per proc', () => {
    const row = wrapper.find('.energy-per-proc')
    expect(row.text()).toBe(
      `x${EnergizingCheerSHealPulse.activations.energy.amount({ skillLevel: mockMember.member.skillLevel })}`
    )
  })

  it('displays the correct helps per proc', () => {
    const row = wrapper.find('.helps-per-proc')
    expect(row.text()).toBe(
      `x${EnergizingCheerSHealPulse.activations.soloHelps.amount({ skillLevel: mockMember.member.skillLevel })}`
    )
  })

  it('displays the correct total energy value', () => {
    const totalEnergy = wrapper.find('.energy-total')
    const expectedValue =
      (mockMember.production.skillValue.energy.amountToTeam + mockMember.production.skillValue.energy.amountToSelf) *
      timeWindowFactor('24H')
    expect(totalEnergy.text()).toContain(compactNumber(expectedValue))
  })

  it('displays the correct total helps value', () => {
    const totalHelps = wrapper.find('.helps-total')
    const expectedValue =
      (mockMember.production.skillValue.helps.amountToTeam + mockMember.production.skillValue.helps.amountToSelf) *
      timeWindowFactor('24H')
    expect(totalHelps.text()).toContain(compactNumber(expectedValue))
  })
})
