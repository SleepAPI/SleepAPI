import serverAxios from '@/router/server-axios'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import type { PokemonInstanceExt, PokemonInstanceWithMeta } from 'sleepapi-common'

class UserServiceImpl {
  public async getUserPokemon() {
    const response = await serverAxios.get<PokemonInstanceWithMeta[]>('user/pokemon')

    const savedPokemon = response.data

    return savedPokemon.map(PokemonInstanceUtils.toPokemonInstanceExt)
  }

  public async upsertPokemon(pokemonInstance: PokemonInstanceExt) {
    const request = PokemonInstanceUtils.toUpsertTeamMemberRequest(pokemonInstance)
    return serverAxios.put('user/pokemon', request)
  }

  public async deletePokemon(externalId: string) {
    return serverAxios.delete(`user/pokemon/${externalId}`)
  }
}

export const UserService = new UserServiceImpl()
