import serverAxios from '@/router/server-axios'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { useUserStore } from '@/stores/user-store'
import type {
  GetRecipeLevelsResponse,
  IslandShortName,
  PokemonInstance,
  PokemonInstanceWithMeta,
  UpdateUserRequest,
  UpsertAreaBonusRequest,
  UpsertRecipeLevelRequest,
  User,
  UserSettingsRequest,
  UserSettingsResponse
} from 'sleepapi-common'

class UserServiceImpl {
  public async getUserSettings() {
    const response = await serverAxios.get<UserSettingsResponse>('user/settings')
    return response.data
  }

  public async getUserPokemon() {
    const response = await serverAxios.get<PokemonInstanceWithMeta[]>('user/pokemon')

    const savedPokemon = response.data

    return savedPokemon.map(PokemonInstanceUtils.toPokemonInstance)
  }

  public async upsertPokemon(pokemonInstance: PokemonInstance) {
    const request = PokemonInstanceUtils.toUpsertTeamMemberRequest(pokemonInstance)
    return serverAxios.put('user/pokemon', request)
  }

  public async deletePokemon(externalId: string) {
    return serverAxios.delete(`user/pokemon/${externalId}`)
  }

  public async updateUser(updated: UpdateUserRequest) {
    const response = (await serverAxios.patch<User>('user', updated)).data
    const userStore = useUserStore()

    userStore.name = response.name
    userStore.externalId = response.external_id
    userStore.role = response.role
    userStore.avatar = response.avatar ?? 'default'
    userStore.friendCode = response.friend_code
  }

  public async getRecipes(): Promise<GetRecipeLevelsResponse> {
    const response = await serverAxios.get<GetRecipeLevelsResponse>('user/recipe')
    return response.data
  }

  public async upsertRecipe(recipe: string, level: number) {
    const response = await serverAxios.put<UpsertRecipeLevelRequest>('user/recipe', { recipe, level })
    return response.data
  }

  public async upsertAreaBonus(shortName: IslandShortName, bonus: number) {
    const response = await serverAxios.put<UpsertAreaBonusRequest>('user/area', { area: shortName, bonus })
    return response.data
  }

  public async upsertUserSettings(settings: UserSettingsRequest) {
    const response = await serverAxios.put<UserSettingsRequest>('user/settings', settings)
    return response.data
  }
}

export const UserService = new UserServiceImpl()
