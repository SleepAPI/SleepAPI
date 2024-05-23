import serverAxios from '@/router/server-axios'
import type { pokemon } from 'sleepapi-common'

class CalculatorServiceImpl {
  public async fetchCardImage(pkmn: string): Promise<string> {
    return `/images/pokemon/${pkmn.toLowerCase()}.png`
  }

  public async fetchPokemonData(pkmn: string): Promise<pokemon.Pokemon> {
    try {
      const response = await serverAxios.get<pokemon.Pokemon>(`pokemon/${pkmn}`)
      return response.data
    } catch (error) {
      console.error('Error fetching data: ', error)
      throw new Error('nope')
    }
  }
}

export const CalculatorService = new CalculatorServiceImpl()
