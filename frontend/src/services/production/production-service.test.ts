import { ProductionService } from '@/services/production/production-service'
import { createMockPokemon } from '@/vitest'
import axios from 'axios'
import { mainskill, maxCarrySize, pokemon, type SingleProductionResponse } from 'sleepapi-common'
import { describe, expect, it, vi } from 'vitest'

vi.mock('axios')

const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>
}

const mockPokemonInstance = createMockPokemon({ pokemon: pokemon.ABOMASNOW })

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

describe('ProductionService', () => {
  it('should calculate single production', async () => {
    mockedAxios.post.mockResolvedValue({ data: mockResponse })

    const result = await ProductionService.calculateSingleProduction(mockPokemonInstance)

    expect(result).toEqual(mockResponse)
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `/api/calculator/production/${mockPokemonInstance.pokemon.name}`,
      {
        camp: false,
        cheer: 0,
        e4eLevel: 1,
        e4eProcs: 0,
        erb: 0,
        extraHelpful: 0,
        helperBoostLevel: 1,
        helperBoostProcs: 0,
        helperBoostUnique: 0,
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

    await expect(ProductionService.calculateSingleProduction(mockPokemonInstance)).rejects.toThrow(
      'Request failed'
    )
  })
})
