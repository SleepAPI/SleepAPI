import type { pokemon } from 'sleepapi-common'

class InputCardServiceImpl {
  public async fetchCardImage(pkmn: string): Promise<string> {
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pkmn.toLowerCase()}`

    return fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        return response.json()
      })
      .then((data) => {
        return data.sprites.front_default
      })
      .catch((error) => {
        console.error('Error fetching data: ', error)
        return ''
      })
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
