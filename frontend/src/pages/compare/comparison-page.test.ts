import ComparisonPage from '@/pages/compare/comparison-page.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import {
  emptyBerryInventory,
  emptyProduce,
  mainskill,
  pokemon,
  type SingleProductionResponse
} from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProductionService } from '@/services/production/production-service'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import type { SingleProductionExt } from '@/types/member/instanced'
import { createMockPokemon } from '@/vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

vi.mock('@/services/production/production-service')

describe('ComparisonPage', () => {
  let wrapper: VueWrapper<InstanceType<typeof ComparisonPage>>
  let pokemonStore: ReturnType<typeof usePokemonStore>

  const mockResponse: SingleProductionResponse = {
    production: {
      detailedProduce: {
        averageTotalSkillProcs: 10,
        dayHelps: 10,
        nightHelps: 10,
        nightHelpsBeforeSS: 10,
        produce: emptyProduce(),
        sneakySnack: emptyBerryInventory(),
        skillActivations: [],
        spilledIngredients: []
      },
      pokemonCombination: {
        ingredientList: [],
        pokemon: pokemon.ABOMASNOW
      }
    },
    summary: {
      ingredientPercentage: 0.2,
      skillPercentage: 0.02,
      carrySize: 10,
      averageEnergy: 10,
      averageFrequency: 10,
      helpsAfterSS: 10,
      helpsBeforeSS: 10,
      nrOfHelps: 10,
      skill: mainskill.CHARGE_ENERGY_S,
      skillDreamShardValue: 10,
      skillBerriesOtherValue: 10,
      skillEnergyOthersValue: 10,
      skillEnergySelfValue: 10,
      skillHelpsValue: 10,
      skillPotSizeValue: 10,
      skillProcs: 10,
      skillProduceValue: emptyProduce(),
      skillStrengthValue: 10,
      skillTastyChanceValue: 10,
      spilledIngredients: [],
      totalProduce: emptyProduce(),
      totalRecovery: 10,
      collectFrequency: { hour: 1, minute: 0, second: 0 }
    }
  }

  const mockPokemon = createMockPokemon()

  const mockMemberProduction: SingleProductionExt = {
    memberExternalId: mockPokemon.externalId,
    ingredients: mockResponse.production.detailedProduce.produce.ingredients,
    berries: mockResponse.production.detailedProduce.produce.berries,
    skillProcs: mockResponse.production.detailedProduce.averageTotalSkillProcs,
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

  beforeEach(async () => {
    setActivePinia(createPinia())
    pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemon)

    ProductionService.calculateCompareProduction = vi.fn().mockResolvedValue(mockResponse)
    wrapper = mount(ComparisonPage)
    wrapper.setData({
      showDialog: false,
      tab: 'overview',
      tabs: [
        { value: 'overview', label: 'Overview' },
        { value: 'strength', label: 'Strength' },
        { value: 'misc', label: 'Misc' }
      ],
      loading: false
    })
    await nextTick()
  })

  it('renders correctly with initial data', async () => {
    const comparisonStore = useComparisonStore()
    comparisonStore.addMember(mockMemberProduction)
    await nextTick()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findAllComponents({ name: 'CompareSlot' })).toHaveLength(1)
  })

  it('opens dialog when add new pokemon card is clicked', async () => {
    wrapper.setData({ pokemonToCompare: [] }) // ensures first card is empty
    await nextTick()

    const addCard = wrapper.find('.compare-slot .v-card')
    expect(addCard.exists()).toBe(true)

    await addCard.trigger('click')
    expect(wrapper.vm.showDialog).toBe(true)
  })

  it('adds a new pokemon to compare members', async () => {
    const compStore = useComparisonStore()
    compStore.addMember(mockMemberProduction)

    const newPokemon = createMockPokemon({ name: 'Misty' })
    await wrapper.vm.addToCompareMembers(newPokemon)

    expect(compStore.members).toHaveLength(2)
    expect(compStore.members[1].memberExternalId).toBe(newPokemon.externalId)
  })

  it('edits an existing pokemon in compare members', async () => {
    const compStore = useComparisonStore()

    compStore.addMember(mockMemberProduction)

    const editedPokemon = createMockPokemon({ name: 'Brock' })
    await wrapper.vm.editCompareMember(editedPokemon)

    expect(pokemonStore.getPokemon(compStore.members[0].memberExternalId)?.name).toBe('Brock')
  })

  it('duplicates a pokemon in compare members', () => {
    const compStore = useComparisonStore()
    compStore.addMember(mockMemberProduction)

    wrapper.vm.duplicateCompareMember(mockPokemon)

    expect(compStore.members).toHaveLength(2)
    expect(pokemonStore.getPokemon(compStore.members[1].memberExternalId)).not.toBe('Ash')
  })

  it('renders the correct tab content when tabs are clicked', async () => {
    const tabs = wrapper.findAll('.v-tab')
    await tabs[1].trigger('click')
    expect(wrapper.vm.tab).toBe('strength')
    await tabs[2].trigger('click')
    expect(wrapper.vm.tab).toBe('misc')
    await tabs[0].trigger('click')
    expect(wrapper.vm.tab).toBe('overview')
  })
})
