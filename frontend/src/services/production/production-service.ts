import axios from 'axios'
import {
  maxCarrySize,
  type PokemonInstanceExt,
  type SingleProductionRequest,
  type SingleProductionResponse
} from 'sleepapi-common'

class ProductionServiceImpl {
  // TODO: should probably take in optional analysis, if outside tool edits pokemon, but doesnt change the pokemon itself we can probably keep old optimal data and save some time
  public async calculateSingleProduction(pokemonInstance: PokemonInstanceExt) {
    // TODO: compare tool should have advanced settings to set these
    const defaultSettings = {
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
      recoveryIncense: false
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

    const response = await axios.post<SingleProductionResponse>(
      `/api/calculator/production/${pokemonInstance.pokemon.name}`,
      request
    )

    return response.data
  }
}

export const ProductionService = new ProductionServiceImpl()
