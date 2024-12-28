import { UserService } from '@/services/user/user-service'
import { useComparisonStore } from '@/stores/comparison-store/comparison-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { defineStore } from 'pinia'
import { RP, getPokemon, type PokemonInstanceExt } from 'sleepapi-common'

export interface PokemonState {
  pokemon: Record<string, PokemonInstanceExt>
}

export const usePokemonStore = defineStore('pokemon', {
  state: (): PokemonState => ({
    pokemon: {}
  }),
  getters: {
    getPokemon: (state) => (externalId: string) => {
      const pokemonInstance = state.pokemon[externalId]
      if (pokemonInstance) {
        return { ...pokemonInstance, pokemon: getPokemon(pokemonInstance.pokemon.name) }
      } else {
        logger.debug(`Pokemon ${externalId} did not exist in Pokémon store`)
      }
    }
  },
  actions: {
    upsertLocalPokemon(pokemon: PokemonInstanceExt) {
      // TODO: instead of calcing we probably should store in db on save and load here
      const rpUtil = new RP(pokemon)
      pokemon.rp = rpUtil.calc()
      this.pokemon[pokemon.externalId] = pokemon
    },
    removePokemon(externalId: string, source: 'team' | 'compare' | 'pokebox') {
      const teamStore = useTeamStore()
      const comparisonStore = useComparisonStore()
      const member = this.getPokemon(externalId)
      if (!member) {
        logger.error(`Pokemon ${externalId} was not found in Pokémon store`)
        return
      }

      // check if this is only time this mon is used
      const nrOfOccurencesTeam = teamStore.teams.flatMap((team) =>
        team.members.filter((m) => m != null && m === externalId)
      ).length
      const nrOfOccurencesCompare = comparisonStore.members.filter((member) => member.externalId === externalId).length

      const safeRemoveFromTeam =
        (source === 'team' && nrOfOccurencesTeam < 2) || (source !== 'team' && nrOfOccurencesTeam === 0)
      const safeRemoveFromCompare =
        (source === 'compare' && nrOfOccurencesCompare < 2) || (source !== 'compare' && nrOfOccurencesCompare === 0)
      const safeRemoval = safeRemoveFromTeam && safeRemoveFromCompare

      if (!member.saved && safeRemoval) {
        delete this.pokemon[externalId]
      }
    },
    upsertServerPokemon(pokemon: PokemonInstanceExt) {
      const userStore = useUserStore()

      if (userStore.loggedIn) {
        try {
          UserService.upsertPokemon(pokemon)
        } catch {
          logger.error('Error upserting pokemon in server')
        }
      }

      this.pokemon[pokemon.externalId] = pokemon
    },
    deleteServerPokemon(externalId: string) {
      const userStore = useUserStore()

      if (userStore.loggedIn) {
        try {
          UserService.deletePokemon(externalId)
        } catch {
          logger.error('Error deleting pokemon in server')
        }
      }

      delete this.pokemon[externalId]
    }
  },
  persist: true
})
