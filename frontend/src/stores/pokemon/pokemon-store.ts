import { type PokemonInstanceExt } from '@/types/member/instanced'
import { defineStore } from 'pinia'

export interface PokemonState {
  pokemon: Record<string, PokemonInstanceExt>
}

export const usePokemonStore = defineStore('pokemon', {
  state: (): PokemonState => ({
    pokemon: {}
  }),
  actions: {
    upsertPokemon(pokemon: PokemonInstanceExt) {
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
