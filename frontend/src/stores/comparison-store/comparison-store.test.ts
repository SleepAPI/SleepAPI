import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import type { MemberProductionExt } from '@/types/member/instanced'
import { createMockPokemon } from '@/vitest'
import { createPinia, setActivePinia } from 'pinia'
import { berry, ingredient } from 'sleepapi-common'
import { beforeEach, describe, expect, it } from 'vitest'

beforeEach(() => {
  setActivePinia(createPinia())
})

const mockMemberProduction: MemberProductionExt = {
  member: createMockPokemon({ name: 'Ash' }),
  ingredients: [
    {
      amount: 10,
      ingredient: ingredient.FANCY_APPLE
    },
    {
      amount: 20,
      ingredient: ingredient.HONEY
    }
  ],
  skillProcs: 5,
  berries: {
    amount: 100,
    berry: berry.BELUE
  }
}

describe('getMemberProduction', () => {
  it('shall return undefined if pokemon not found', () => {
    const comparisonStore = useComparisonStore()
    expect(comparisonStore.getMemberProduction('missing')).toBeUndefined()
  })

  it('shall return production for matching pokemon', () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)

    expect(
      comparisonStore.getMemberProduction(mockMemberProduction.member.externalId)
    ).not.toBeUndefined()
  })
})

describe('fullTeam', () => {
  it('shall return true if >= 10', () => {
    const comparisonStore = useComparisonStore()

    for (let i = 0; i < 10; i++) {
      comparisonStore.addMember(mockMemberProduction)
    }
    expect(comparisonStore.fullTeam).toBe(true)
  })

  it('shall return true if < 10', () => {
    const comparisonStore = useComparisonStore()

    for (let i = 0; i < 9; i++) {
      comparisonStore.addMember(mockMemberProduction)
    }
    expect(comparisonStore.fullTeam).toBe(false)
  })
})

describe('addMember', () => {
  it('shall add member to the comparison array', () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)

    expect(comparisonStore.members).toHaveLength(1)
  })
})
