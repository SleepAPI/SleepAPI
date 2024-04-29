import type { pokemon } from 'sleepapi-common'

class InputCardServiceImpl {
  public async fetchCardImage(pkmn: string): Promise<string> {
    return `/images/pokemon/${pkmn.toLowerCase()}.png`
  }

  public async fetchPokemonData(pkmn: string): Promise<pokemon.Pokemon> {
    return fetch(`/api/pokemon/${pkmn}`)
      .then(async (data) => {
        return (await data.json()) as pokemon.Pokemon
      })
      .catch((error) => {
        console.error('Error fetching data: ', error)
        throw new Error('nope')
      })
  }
}

export const InputCardService = new InputCardServiceImpl()
