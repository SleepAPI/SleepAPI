import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import axios from 'axios'
import {
  mainskill,
  maxCarrySize,
  type PokemonInstanceExt,
  type SingleProductionRequest,
  type SingleProductionResponse
} from 'sleepapi-common'

class ProductionServiceImpl {
  public async calculateSingleProduction(pokemonName: string, request: SingleProductionRequest) {
    const response = await axios.post<SingleProductionResponse>(
      `/api/calculator/production/${pokemonName}?includeAnalysis=true`,
      request
    )

    return response.data
  }

  public async calculateCompareProduction(pokemonInstance: PokemonInstanceExt) {
    const comparisonStore = useComparisonStore()
    const defaultSettings = {
      camp: comparisonStore.camp,
      cheer: comparisonStore.cheer,
      e4eLevel: mainskill.ENERGY_FOR_EVERYONE.maxLevel,
      e4eProcs: comparisonStore.e4e,
      erb: comparisonStore.erb,
      extraHelpful: comparisonStore.extraHelpful,
      helperBoostLevel: mainskill.HELPER_BOOST.maxLevel,
      helperBoostProcs: comparisonStore.helperBoost,
      helperBoostUnique: comparisonStore.helperBoostUnique,
      helpingbonus: comparisonStore.helpingBonus,
      mainBedtime: comparisonStore.bedtime,
      mainWakeup: comparisonStore.wakeup,
      recoveryIncense: comparisonStore.recoveryIncense
    }

    const nrOfEvolutions = (maxCarrySize(pokemonInstance.pokemon) - pokemonInstance.carrySize) / 5

    const request: SingleProductionRequest = {
      ...defaultSettings,
      level: pokemonInstance.level,
      skillLevel: pokemonInstance.skillLevel,
      ribbon: pokemonInstance.ribbon,
      nature: pokemonInstance.nature.name,
      subskills: pokemonInstance.subskills
        .sort((a, b) => a.level - b.level)
        .map((s) => s.subskill.name),
      ingredientSet: pokemonInstance.ingredients.map(({ ingredient }) => ingredient.name),
      nrOfEvolutions
    }

    return await this.calculateSingleProduction(pokemonInstance.pokemon.name, request)
  }
}

export const ProductionService = new ProductionServiceImpl()
