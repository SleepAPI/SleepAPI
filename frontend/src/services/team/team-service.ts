import serverAxios from '@/router/server-axios'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { UnexpectedError } from '@/types/errors/unexpected-error'
import {
  MAX_TEAM_MEMBERS,
  type TeamCombinedProduction,
  type TeamInstance,
  type TeamProductionExt
} from '@/types/member/instanced'
import axios from 'axios'
import {
  Optimal,
  berry,
  uuid,
  type BerrySet,
  type CalculateIvResponse,
  type CalculateTeamResponse,
  type GetTeamsResponse,
  type IngredientSet,
  type PokemonInstanceExt,
  type PokemonInstanceIdentity,
  type TeamSettings,
  type UpsertTeamMemberResponse,
  type UpsertTeamMetaRequest,
  type UpsertTeamMetaResponse
} from 'sleepapi-common'

class TeamServiceImpl {
  public async createOrUpdateTeam(index: number, teamInfo: UpsertTeamMetaRequest) {
    const response = await serverAxios.put<UpsertTeamMetaResponse>(`team/meta/${index}`, teamInfo)

    return response.data
  }

  public async createOrUpdateMember(params: { teamIndex: number; memberIndex: number; member: PokemonInstanceExt }) {
    const { teamIndex, memberIndex, member } = params

    const request = PokemonInstanceUtils.toUpsertTeamMemberRequest(member)

    return await serverAxios.put<UpsertTeamMemberResponse>(`team/${teamIndex}/member/${memberIndex}`, request)
  }

  public async getTeams(): Promise<TeamInstance[]> {
    const response = await serverAxios.get<GetTeamsResponse>('team')

    const serverTeams = response.data.teams
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    const teams: TeamInstance[] = []
    for (let teamIndex = 0; teamIndex < teamStore.maxAvailableTeams; teamIndex++) {
      const serverTeam = serverTeams.find((team) => team.index === teamIndex)
      if (!serverTeam) {
        const emptyTeam: TeamInstance = {
          index: teamIndex,
          memberIndex: 0,
          name: `Helper team ${teamIndex + 1}`,
          camp: false,
          bedtime: '21:30',
          wakeup: '06:00',
          recipeType: 'curry',
          favoredBerries: [],
          version: 0,
          members: new Array(MAX_TEAM_MEMBERS).fill(undefined),
          memberIvs: {},
          production: undefined
        }
        teams.push(emptyTeam)
      } else {
        const members: (string | undefined)[] = []
        for (let memberIndex = 0; memberIndex < MAX_TEAM_MEMBERS; memberIndex++) {
          const serverMember = serverTeam.members.find((member) => member.memberIndex === memberIndex)

          if (!serverMember) {
            members.push(undefined)
          } else {
            const cachedMember = PokemonInstanceUtils.toPokemonInstanceExt(serverMember)
            pokemonStore.upsertLocalPokemon(cachedMember)
            members.push(cachedMember.externalId)
          }
        }

        const favoredBerries: berry.Berry[] = []
        if (serverTeam.favoredBerries?.length === 1 && serverTeam.favoredBerries[0] === 'all') {
          favoredBerries.push(...berry.BERRIES)
        } else {
          for (const berryName of serverTeam.favoredBerries ?? []) {
            const favoredBerry = berry.BERRIES.find((berry) => berry.name === berryName)
            if (!favoredBerry) {
              logger.error(`Couldn't find favored berry with name: ${berryName}, contact developer`)
              continue
            }
            favoredBerries.push(favoredBerry)
          }
        }
        const instancedTeam: TeamInstance = {
          index: serverTeam.index,
          memberIndex: teamStore.teams[serverTeam.index]?.memberIndex ?? 0,
          name: serverTeam.name,
          camp: serverTeam.camp,
          bedtime: serverTeam.bedtime,
          wakeup: serverTeam.wakeup,
          recipeType: serverTeam.recipeType,
          favoredBerries,
          version: serverTeam.version,
          members,
          memberIvs: {},
          production: undefined
        }
        teams.push(instancedTeam)
      }
    }

    return teams
  }

  public async deleteTeam(index: number) {
    return await serverAxios.delete(`team/${index}`)
  }

  public async removeMember(params: { teamIndex: number; memberIndex: number }) {
    const { teamIndex, memberIndex } = params
    await serverAxios.delete(`team/${teamIndex}/member/${memberIndex}`)
  }

  public async calculateProduction(params: {
    members: PokemonInstanceExt[]
    settings: TeamSettings
  }): Promise<TeamProductionExt | undefined> {
    const { members, settings } = params
    if (members.length === 0) {
      return undefined
    }

    const parsedMembers: PokemonInstanceIdentity[] = members.map((member) =>
      PokemonInstanceUtils.toPokemonInstanceIdentity(member)
    )

    const response = await axios.post<CalculateTeamResponse>('/api/calculator/team', {
      members: parsedMembers,
      settings
    })

    const teamBerries: BerrySet[] = response.data.members.flatMap((member) => member.produceTotal.berries)
    const teamIngredients: IngredientSet[] = response.data.members.flatMap((member) => member.produceTotal.ingredients)
    // TODO: is team production used?
    const teamProduction: TeamCombinedProduction = {
      berries: teamBerries,
      ingredients: teamIngredients,
      cooking: response.data.cooking
    }

    return {
      members: response.data.members,
      team: teamProduction
    }
  }

  public async calculateCurrentMemberIv() {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    const currentMember = pokemonStore.getPokemon(teamStore.getCurrentMember ?? 'missing')
    if (!currentMember) {
      logger.error(`Can't calculate iv for Pokémon not found: ${teamStore.getCurrentMember}`)
      return
    }
    const currentTeam = teamStore.getCurrentTeam

    const members: PokemonInstanceExt[] = []
    for (const memberId of currentTeam.members) {
      if (memberId && memberId !== teamStore.getCurrentMember) {
        const member = pokemonStore.getPokemon(memberId)
        member && members.push(member)
      }
    }

    const settings: TeamSettings = {
      camp: currentTeam.camp,
      bedtime: currentTeam.bedtime,
      wakeup: currentTeam.wakeup
    }

    const berrySetup: PokemonInstanceIdentity = PokemonInstanceUtils.toPokemonInstanceIdentity({
      ...currentMember,
      ...Optimal.berry(currentMember.pokemon),
      externalId: uuid.v4()
    })
    const ingredientSetup: PokemonInstanceIdentity = PokemonInstanceUtils.toPokemonInstanceIdentity({
      ...currentMember,
      ...Optimal.ingredient(currentMember.pokemon),
      externalId: uuid.v4()
    })
    const skillSetup: PokemonInstanceIdentity = PokemonInstanceUtils.toPokemonInstanceIdentity({
      ...currentMember,
      ...Optimal.skill(currentMember.pokemon),
      externalId: uuid.v4()
    })

    const parsedMembers: PokemonInstanceIdentity[] = members.map((member) =>
      PokemonInstanceUtils.toPokemonInstanceIdentity(member)
    )

    const response = await axios.post<CalculateIvResponse>('/api/calculator/iv', {
      members: parsedMembers,
      variants: [berrySetup, ingredientSetup, skillSetup],
      settings
    })

    const berryProduction = response.data.variants.find((variant) => variant.externalId === berrySetup.externalId)
    const ingredientProduction = response.data.variants.find(
      (variant) => variant.externalId === ingredientSetup.externalId
    )
    const skillProduction = response.data.variants.find((variant) => variant.externalId === skillSetup.externalId)
    if (!berryProduction || !ingredientProduction || !skillProduction) {
      throw new UnexpectedError('Iv variants not returned in response')
    }

    return {
      optimalBerry: berryProduction,
      optimalIngredient: ingredientProduction,
      optimalSkill: skillProduction
    }
  }
}

export const TeamService = new TeamServiceImpl()
