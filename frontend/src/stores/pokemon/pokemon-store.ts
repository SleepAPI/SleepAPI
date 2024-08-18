import { UserService } from '@/services/user/user-service'
import { useUserStore } from '@/stores/user-store'
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
    upsertLocalPokemon(pokemon: PokemonInstanceExt) {
      // TODO: instead of calcing we probably should store in db on save and load here
      const rpUtil = new RP(pokemon)
      pokemon.rp = rpUtil.calc()
      this.pokemon[pokemon.externalId] = pokemon
    },
    removePokemon(externalId: string) {
      delete this.pokemon[externalId]
    },
    upsertServerPokemon(pokemon: PokemonInstanceExt) {
      const userStore = useUserStore()

      if (userStore.loggedIn) {
        try {
          UserService.upsertPokemon(pokemon)
        } catch (error) {
          console.error('Error upserting pokemon in server')
        }
      }

      this.pokemon[pokemon.externalId] = pokemon
    },
    deleteServerPokemon(externalId: string) {
      const userStore = useUserStore()

      if (userStore.loggedIn) {
        try {
          UserService.deletePokemon(externalId)
        } catch (error) {
          console.error('Error upserting pokemon in server')
        }
      }
    }
  },
  getters: {
    getPokemon: (state) => (externalId: string) => state.pokemon[externalId]
  },
  persist: true
})
