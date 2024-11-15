import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { createMockMemberProduction } from '@/vitest'
import { createPinia, setActivePinia } from 'pinia'
import { type MemberProduction } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  setActivePinia(createPinia())
})

const mockMemberProduction: MemberProduction = createMockMemberProduction()

describe('getMemberProduction', () => {
  it('shall return undefined if pokemon not found', () => {
    const comparisonStore = useComparisonStore()
    expect(comparisonStore.getMemberProduction('missing')).toBeUndefined()
  })

  it('shall return production for matching pokemon', () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)

    expect(comparisonStore.getMemberProduction(mockMemberProduction.externalId)).not.toBeUndefined()
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

describe('removeMember', () => {
  it('shall remove pokemon', () => {
    const pokemonStore = usePokemonStore()
    pokemonStore.removePokemon = vi.fn()
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)
    comparisonStore.addMember({ ...mockMemberProduction, externalId: 'other id' })

    expect(comparisonStore.members).toHaveLength(2)
    comparisonStore.removeMember(mockMemberProduction.externalId)
    expect(comparisonStore.members).toHaveLength(1)
  })
})

describe('migrate', () => {
  it('shall set domainVersion if not already set', () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.domainVersion = 0
    comparisonStore.migrate()
    expect(comparisonStore.domainVersion).toBeGreaterThan(0)
  })
})

describe('outdate', () => {
  it('shall reset the store and set domainVersion', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)
    comparisonStore.outdate()
    expect(comparisonStore.members).toHaveLength(0)
    expect(comparisonStore.domainVersion).toBeGreaterThan(0)
  })
})
