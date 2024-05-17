import axios from 'axios'
import type { pokemon } from 'sleepapi-common'

class InputCardServiceImpl {
  public async fetchCardImage(pkmn: string): Promise<string> {
    return `/images/pokemon/${pkmn.toLowerCase()}.png`
  }

  public async fetchPokemonData(pkmn: string): Promise<pokemon.Pokemon> {
    try {
      const response = await axios.get<pokemon.Pokemon>(`/api/pokemon/${pkmn}`)
      return response.data
    } catch (error) {
      console.error('Error fetching data: ', error)
      throw new Error('nope')
    }
  }
}

export const InputCardService = new InputCardServiceImpl()
