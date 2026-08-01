import MemberProductionSkill from '@/components/calculator/results/member-results/member-production-header/member-production-skill.vue'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { timeWindowFactor } from '@/types/time/time-window'
import { mocks } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import type { VueWrapper } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import {
  berry,
  BerryBurstDracoMeteor,
  compactNumber,
  DRAGONAIR,
  DRAGONITE,
  DRATINI,
  LATIAS,
  LATIOS,
  MathUtils
} from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const mockMember = mocks.createMockMemberWithProduction({
  member: mocks.createMockPokemon({ pokemon: LATIOS, skillLevel: 6, level: 1 }),
  production: mocks.createMockMemberProduction({
    skillLevel: 6,
    produceFromSkill: {
      berries: [
        { amount: 217.5334637964775, berry: LATIOS.berry, level: 1 },
        { amount: 42.7, berry: berry.ORAN, level: 1 }
      ],
      ingredients: []
    }
  })
})

describe('DracoMeteorBerryBurstDetails', () => {
  let wrapper: VueWrapper<InstanceType<typeof MemberProductionSkill>>
  let teamStore: ReturnType<typeof useTeamStore>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  beforeEach(async () => {
    teamStore = useTeamStore()
    pokemonStore = usePokemonStore()

    const latios = mocks.createMockPokemon({
      externalId: mockMember.member.externalId,
      pokemon: LATIOS,
      skillLevel: 6,
      level: 1
    })
    const latias = mocks.createMockPokemon({ externalId: 'latias-id', pokemon: LATIAS })
    const dratini = mocks.createMockPokemon({ externalId: 'dratini-id', pokemon: DRATINI })
    const dragonair = mocks.createMockPokemon({ externalId: 'dragonair-id', pokemon: DRAGONAIR })
    const dragonite = mocks.createMockPokemon({ externalId: 'dragonite-id', pokemon: DRAGONITE })

    pokemonStore.upsertLocalPokemon(latios)
    pokemonStore.upsertLocalPokemon(latias)
    pokemonStore.upsertLocalPokemon(dratini)
    pokemonStore.upsertLocalPokemon(dragonair)
    pokemonStore.upsertLocalPokemon(dragonite)

    teamStore.teams = createMockTeams(1, {
      members: [latios.externalId, latias.externalId, dratini.externalId, dragonair.externalId, dragonite.externalId]
    })

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

  it('displays the paired distinct-species berry values per proc', () => {
    const perProcValues = wrapper.findAll('.per-proc-amount')
    const sameTypeSpeciesCount = 5

    expect(perProcValues.at(0)?.text()).toBe(
      `x${BerryBurstDracoMeteor.activations.paired.amount({ skillLevel: mockMember.member.skillLevel, extra: sameTypeSpeciesCount })}`
    )
    expect(perProcValues.at(1)?.text()).toBe(
      `x${BerryBurstDracoMeteor.activations.paired.teamAmount!({ skillLevel: mockMember.member.skillLevel, extra: sameTypeSpeciesCount })}`
    )
  })

  it('displays rounded self berry totals from produceFromSkill', () => {
    const totalSkillValue = wrapper.findAll('.font-weight-medium.text-no-wrap.text-center')
    const factor = timeWindowFactor('24H')
    const selfAmount =
      mockMember.production.produceFromSkill.berries.find(
        (b) => b.berry.name === LATIOS.berry.name && b.level === mockMember.member.level
      )?.amount ?? 0

    expect(totalSkillValue.at(0)?.text()).toContain(
      `${compactNumber(MathUtils.round(selfAmount * factor, 1))} ${LATIOS.berry.name.toLowerCase()}`
    )
  })

  it('displays rounded team berry totals from produceFromSkill', () => {
    const totalSkillValue = wrapper.findAll('.font-weight-medium.text-no-wrap.text-center')
    const factor = timeWindowFactor('24H')
    const teamAmount = mockMember.production.produceFromSkill.berries.reduce((sum, cur) => {
      return sum + (cur.berry.name === LATIOS.berry.name && cur.level === mockMember.member.level ? 0 : cur.amount)
    }, 0)

    expect(totalSkillValue.at(1)?.text()).toContain(`${compactNumber(MathUtils.round(teamAmount * factor, 1))} other`)
  })
})
