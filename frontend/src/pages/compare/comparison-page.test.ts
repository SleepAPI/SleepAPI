import ComparisonPage from '@/pages/compare/comparison-page.vue'
import { mount, VueWrapper } from '@vue/test-utils'
import { mainskill, pokemon, type SingleProductionResponse } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProductionService } from '@/services/production/production-service'
import type { MemberProductionExt } from '@/types/member/instanced'
import { createMockPokemon } from '@/vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

vi.mock('@/services/production/production-service')

describe('ComparisonPage', () => {
  let wrapper: VueWrapper<InstanceType<typeof ComparisonPage>>

  const mockResponse: SingleProductionResponse = {
    production: {
      detailedProduce: {
        averageTotalSkillProcs: 10,
        dayHelps: 10,
        nightHelps: 10,
        nightHelpsBeforeSS: 10,
        produce: {
          ingredients: []
        },
        skillActivations: [],
        spilledIngredients: []
      },
      pokemonCombination: {
        ingredientList: [],
        pokemon: pokemon.ABOMASNOW
      }
    },
    summary: {
      averageEnergy: 10,
      averageFrequency: 10,
      helpsAfterSS: 10,
      helpsBeforeSS: 10,
      nrOfHelps: 10,
      skill: mainskill.CHARGE_ENERGY_S,
      skillDreamShardValue: 10,
      skillEnergyOthersValue: 10,
      skillEnergySelfValue: 10,
      skillHelpsValue: 10,
      skillPotSizeValue: 10,
      skillProcs: 10,
      skillProduceValue: { ingredients: [] },
      skillStrengthValue: 10,
      skillTastyChanceValue: 10,
      spilledIngredients: [],
      totalProduce: {
        ingredients: []
      },
      totalRecovery: 10,
      collectFrequency: { hour: 1, minute: 0, second: 0 }
    }
  }

  const mockMemberProduction: MemberProductionExt = {
    member: createMockPokemon({ name: 'Ash' }),
    ingredients: mockResponse.production.detailedProduce.produce.ingredients,
    berries: mockResponse.production.detailedProduce.produce.berries,
    skillProcs: mockResponse.production.detailedProduce.averageTotalSkillProcs
  }

  beforeEach(async () => {
    setActivePinia(createPinia())

    ProductionService.calculateSingleProduction = vi.fn().mockResolvedValue(mockResponse)
    wrapper = mount(ComparisonPage)
    wrapper.setData({
      pokemonToCompare: [mockMemberProduction],
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

  it('renders correctly with initial data', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findAllComponents({ name: 'CompareSlot' })).toHaveLength(1)
  })

  it('opens dialog when add new pokemon card is clicked', async () => {
    wrapper.setData({ pokemonToCompare: [] }) // ensures first card is empty
    await nextTick()

    const addCard = wrapper.find('.team-slot .v-card')
    expect(addCard.exists()).toBe(true)

    await addCard.trigger('click')
    expect(wrapper.vm.showDialog).toBe(true)
  })

  it('adds a new pokemon to compare members', async () => {
    const newPokemon = createMockPokemon({ name: 'Misty' })
    await wrapper.vm.addToCompareMembers(newPokemon)

    expect(wrapper.vm.pokemonToCompare).toHaveLength(2)
    expect(wrapper.vm.pokemonToCompare[1].member.name).toBe('Misty')
  })

  it('edits an existing pokemon in compare members', async () => {
    const editedPokemon = { ...mockMemberProduction.member, name: 'Brock' }
    await wrapper.vm.editCompareMember(editedPokemon)

    expect(wrapper.vm.pokemonToCompare[0].member.name).toBe('Brock')
  })

  it('duplicates a pokemon in compare members', () => {
    wrapper.vm.duplicateCompareMember(mockMemberProduction.member)

    expect(wrapper.vm.pokemonToCompare).toHaveLength(2)
    expect(wrapper.vm.pokemonToCompare[1].member.name).not.toBe('Ash')
  })

  it('removes a pokemon from compare members', () => {
    wrapper.vm.removeCompareMember(mockMemberProduction.member)

    expect(wrapper.vm.pokemonToCompare).toHaveLength(0)
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
