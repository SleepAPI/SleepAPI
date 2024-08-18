import serverAxios from '@/router/server-axios'
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import {
  MAX_TEAM_MEMBERS,
  type TeamCombinedProduction,
  type TeamInstance,
  type TeamProductionExt
} from '@/types/member/instanced'
import axios from 'axios'
import {
  type BerrySet,
  type CalculateTeamResponse,
  type GetTeamsResponse,
  type IngredientSet,
  type PokemonInstanceExt,
  type PokemonInstanceIdentity,
  type TeamSettingsRequest,
  type UpsertTeamMemberResponse,
  type UpsertTeamMetaRequest,
  type UpsertTeamMetaResponse
} from 'sleepapi-common'

class TeamServiceImpl {
  public async createOrUpdateTeam(index: number, teamInfo: UpsertTeamMetaRequest) {
    const response = await serverAxios.put<UpsertTeamMetaResponse>(`team/meta/${index}`, teamInfo)

    return response.data
  }

  public async createOrUpdateMember(params: {
    teamIndex: number
    memberIndex: number
    member: PokemonInstanceExt
  }) {
    const { teamIndex, memberIndex, member } = params

    const request = PokemonInstanceUtils.toUpsertTeamMemberRequest(member)

    return await serverAxios.put<UpsertTeamMemberResponse>(
      `team/${teamIndex}/member/${memberIndex}`,
      request
    )
  }

  public async getTeams(): Promise<TeamInstance[]> {
    const response = await serverAxios.get<GetTeamsResponse>('team')

    const existingTeams = response.data.teams
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    const teams: TeamInstance[] = []
    for (let teamIndex = 0; teamIndex < teamStore.maxAvailableTeams; teamIndex++) {
      const existingTeam = existingTeams.find((team) => team.index === teamIndex)
      if (!existingTeam) {
        const emptyTeam: TeamInstance = {
          index: teamIndex,
          name: `Helper team ${teamIndex + 1}`,
          camp: false,
          bedtime: '21:30',
          wakeup: '06:00',
          version: 0,
          members: new Array(MAX_TEAM_MEMBERS).fill(undefined),
          production: undefined
        }
        teams.push(emptyTeam)
      } else {
        const members: (string | undefined)[] = []
        for (let memberIndex = 0; memberIndex < MAX_TEAM_MEMBERS; memberIndex++) {
          const existingMember = existingTeam.members.find(
            (member) => member.memberIndex === memberIndex
          )

          if (!existingMember) {
            members.push(undefined)
          } else {
            const cachedMember = PokemonInstanceUtils.toPokemonInstanceExt(existingMember)
            pokemonStore.upsertLocalPokemon(cachedMember)
            members.push(cachedMember.externalId)
          }
        }

        const instancedTeam: TeamInstance = {
          index: existingTeam.index,
          name: existingTeam.name,
          camp: existingTeam.camp,
          bedtime: existingTeam.bedtime,
          wakeup: existingTeam.wakeup,
          version: existingTeam.version,
          members,
          production: undefined
        }
        teams.push(instancedTeam)
      }
    }

    return teams
  }

  public async removeMember(params: { teamIndex: number; memberIndex: number }) {
    const { teamIndex, memberIndex } = params
    await serverAxios.delete(`team/${teamIndex}/member/${memberIndex}`)
  }

  // TODO: not tested?
  public async calculateProduction(params: {
    members: PokemonInstanceExt[]
    settings: TeamSettingsRequest
  }) {
    const { members, settings } = params
    if (members.length === 0) {
      return undefined
    }

    const parsedMembers: PokemonInstanceIdentity[] = members.map((member) => ({
      pokemon: member.pokemon.name,
      nature: member.nature.name,
      subskills: member.subskills.map((subskill) => ({
        level: subskill.level,
        subskill: subskill.subskill.name
      })),
      ingredients: member.ingredients.map((ingredient) => ({
        level: ingredient.level,
        ingredient: ingredient.ingredient.name
      })),
      carrySize: member.carrySize,
      level: member.level,
      ribbon: member.ribbon,
      skillLevel: member.skillLevel,
      externalId: member.externalId
    }))

    const response = await axios.post<CalculateTeamResponse>('/api/calculator/team', {
      members: parsedMembers,
      settings
    })

    const teamBerries: BerrySet[] = response.data.members.flatMap((member) =>
      member.berries ? member.berries : []
    )
    const teamIngredients: IngredientSet[] = response.data.members.flatMap(
      (member) => member.ingredients
    )
    const teamProduction: TeamCombinedProduction = {
      berries: teamBerries,
      ingredients: teamIngredients
    }

    const pokemonStore = usePokemonStore()
    const result: TeamProductionExt = {
      members: response.data.members.map((member) => {
        if (!member.externalId) {
          console.error('Unidentified member in team calculation, contact developer')
          throw new Error('Unidentified member in team calculation')
        }
        return {
          berries: member.berries,
          ingredients: member.ingredients,
          skillProcs: member.skillProcs,
          member: pokemonStore.getPokemon(member.externalId)
        }
      }),
      team: teamProduction
    }

    return result
  }
}

export const TeamService = new TeamServiceImpl()
