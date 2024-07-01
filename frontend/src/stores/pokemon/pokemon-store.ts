import { defineStore } from 'pinia'
import { RP, type PokemonInstanceExt } from 'sleepapi-common'

export interface PokemonState {
  pokemon: Record<string, PokemonInstanceExt>
}

export const usePokemonStore = defineStore('pokemon', {
  state: (): PokemonState => ({
    pokemon: {}
  }),
  actions: {
    upsertPokemon(pokemon: PokemonInstanceExt) {
      // TODO: instead of calcing we probably should store in db on save and load here
      const rpUtil = new RP(pokemon)
      pokemon.rp = rpUtil.calc()
      this.pokemon[pokemon.externalId] = pokemon
    },
    removePokemon(externalId: string) {
      delete this.pokemon[externalId]
    }
  },
  getters: {
    getPokemon: (state) => (externalId: string) => state.pokemon[externalId]
  },
  persist: true
})
