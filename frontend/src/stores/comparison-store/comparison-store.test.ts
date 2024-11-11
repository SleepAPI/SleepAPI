import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import type { SingleProductionExt } from '@/types/member/instanced'
import { createMockPokemon } from '@/vitest'
import { createPinia, setActivePinia } from 'pinia'
import { berry, ingredient } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  setActivePinia(createPinia())
})

const mockPokemon = createMockPokemon({ name: 'Ash' })
const mockMemberProduction: SingleProductionExt = {
  externalId: mockPokemon.externalId,
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
  berries: [
    {
      amount: 100,
      berry: berry.BELUE,
      level: mockPokemon.level
    }
  ],
  ingredientPercentage: 0.2,
  skillPercentage: 0.02,
  carrySize: 10,
  averageEnergy: 10,
  averageFrequency: 10,
  dayHelps: 10,
  nightHelps: 10,
  nrOfHelps: 10,
  sneakySnackHelps: 10,
  spilledIngredients: [],
  totalRecovery: 10,
  sneakySnack: []
}

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

describe('toggleCamp', () => {
  it('shall toggle camp', () => {
    const comparisonStore = useComparisonStore()
    expect(comparisonStore.camp).toBe(false)
    comparisonStore.toggleCamp()
    expect(comparisonStore.camp).toBe(true)
  })
})
describe('toggleRecoveryIncense', () => {
  it('shall toggle recovery incense', () => {
    const comparisonStore = useComparisonStore()
    expect(comparisonStore.recoveryIncense).toBe(false)
    comparisonStore.toggleRecoveryIncense()
    expect(comparisonStore.recoveryIncense).toBe(true)
  })
})
describe('updateSleep', () => {
  it('shall update sleep', () => {
    const comparisonStore = useComparisonStore()
    expect(comparisonStore.wakeup).toEqual('06:00')
    expect(comparisonStore.bedtime).toEqual('21:30')
    comparisonStore.updateSleep({ wakeup: '07:00', bedtime: '22:00' })
    expect(comparisonStore.wakeup).toEqual('07:00')
    expect(comparisonStore.bedtime).toEqual('22:00')
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
  it('shall reset the store and set domainVersion', () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)
    comparisonStore.outdate()
    expect(comparisonStore.members).toHaveLength(0)
    expect(comparisonStore.domainVersion).toBeGreaterThan(0)
  })
})
