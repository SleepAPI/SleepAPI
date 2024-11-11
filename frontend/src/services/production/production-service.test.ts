import { ProductionService } from '@/services/production/production-service'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { createMockPokemon } from '@/vitest'
import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import {
  emptyBerryInventory,
  emptyProduce,
  mainskill,
  maxCarrySize,
  pokemon,
  type SingleProductionResponse
} from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('axios')

const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>
}

vi.mock('@/router/server-axios', () => ({}))
let pokemonStore: ReturnType<typeof usePokemonStore>

const mockPokemonInstance = createMockPokemon({ pokemon: pokemon.ABOMASNOW })

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
    skillEnergyOthersValue: 10,
    skillEnergySelfValue: 10,
    skillBerriesOtherValue: 10,
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

describe('ProductionService', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon(mockPokemonInstance)
  })

  describe('calculateCompareProduction', () => {
    it('should calculate compare production', async () => {
      mockedAxios.post.mockResolvedValue({ data: mockResponse })

      const result = await ProductionService.calculateCompareProduction(mockPokemonInstance)

      expect(result).toEqual(mockResponse)
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `/api/calculator/production/${mockPokemonInstance.pokemon.name}?includeAnalysis=true`,
        {
          camp: false,
          cheer: 0,
          e4eLevel: mainskill.ENERGY_FOR_EVERYONE.maxLevel,
          e4eProcs: 0,
          erb: 0,
          extraHelpful: 0,
          helperBoostLevel: mainskill.HELPER_BOOST.maxLevel,
          helperBoostProcs: 0,
          helperBoostUnique: 1,
          helpingbonus: 0,
          mainBedtime: '21:30',
          mainWakeup: '06:00',
          recoveryIncense: false,
          level: mockPokemonInstance.level,
          skillLevel: mockPokemonInstance.skillLevel,
          ribbon: mockPokemonInstance.ribbon,
          nature: mockPokemonInstance.nature.name,
          subskills: mockPokemonInstance.subskills,
          ingredientSet: mockPokemonInstance.ingredients.map((ing) => ing.ingredient.name),
          nrOfEvolutions:
            (maxCarrySize(mockPokemonInstance.pokemon) - mockPokemonInstance.carrySize) / 5
        }
      )
    })

    it('should throw an error if the request fails', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Request failed'))

      await expect(
        ProductionService.calculateCompareProduction(mockPokemonInstance)
      ).rejects.toThrow('Request failed')
    })
  })
})
