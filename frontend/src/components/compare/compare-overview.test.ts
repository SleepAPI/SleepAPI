import CompareOverview from '@/components/compare/compare-overview.vue'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import type { SingleProductionExt } from '@/types/member/instanced'
import { createMockPokemon } from '@/vitest'
import { createMockSingleProduction } from '@/vitest/mocks/compare/single-production'
import { VueWrapper, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { MathUtils } from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

describe('CompareOverview', () => {
  let wrapper: VueWrapper<InstanceType<typeof CompareOverview>>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  const mockPokemon = createMockPokemon({ name: 'Ash' })
  const mockMemberProduction: SingleProductionExt = createMockSingleProduction()

  beforeEach(() => {
    setActivePinia(createPinia())
    pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)
    wrapper = mount(CompareOverview, {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('renders member data correctly', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)

    await nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)

    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells.length).toBe(4)

    // Check member name
    expect(firstRowCells[0].text()).toContain(mockPokemon.name)

    // Check berries
    expect(firstRowCells[1].text()).toContain('100')

    // Check ingredients
    expect(firstRowCells[2].text()).toContain('10')
    expect(firstRowCells[2].text()).toContain('20')

    // Check skill procs
    expect(firstRowCells[3].text()).toContain('5')
  })

  it('renders 8h time window correctly', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)
    comparisonStore.timeWindow = '8H'

    await nextTick()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(1)

    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells.length).toBe(4)

    // Check member name
    expect(firstRowCells[0].text()).toContain('Ash')

    // Check berries
    expect(firstRowCells[1].text()).toContain('33.3')

    // Check ingredients
    expect(firstRowCells[2].text()).toContain('3.3')
    expect(firstRowCells[2].text()).toContain('6.7')

    // Check skill procs
    expect(firstRowCells[3].text()).toContain('1.7')
  })

  it('correctly computes the rounded values', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)

    await nextTick()

    const members = wrapper.vm.members as any[]
    expect(members[0].berries).toBe(MathUtils.round(100, 1))
    expect(members[0].skillProcs).toBe(MathUtils.round(5, 1))
  })

  it('displays ingredient images correctly', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)

    await nextTick()

    const ingredientImages = wrapper.findAll('tbody tr td:nth-child(3) .v-img img')
    expect(ingredientImages.length).toBe(2)
    expect(ingredientImages[0].attributes('src')).toBe('/images/ingredient/apple.png')
    expect(ingredientImages[1].attributes('src')).toBe('/images/ingredient/honey.png')
  })

  it('displays the correct number of headers', () => {
    const headers = wrapper.findAll('thead th')
    expect(headers.length).toBe(4)
    expect(headers[0].text()).toBe('Name')
    expect(headers[1].text()).toBe('Berry')
    expect(headers[2].text()).toBe('Ingredient')
    expect(headers[3].text()).toBe('Skill')
  })
})
