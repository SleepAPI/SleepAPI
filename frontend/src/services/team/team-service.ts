import serverAxios from '@/router/server-axios'
import { useTeamStore } from '@/stores/team/team-store'
import {
  MAX_TEAM_MEMBERS,
  type InstancedPokemonExt,
  type InstancedTeamExt
} from '@/types/member/instanced'
import {
  getIngredient,
  getNature,
  getPokemon,
  getSubskill,
  type GetTeamsResponse,
  type PokemonInstance,
  type UpsertTeamMemberRequest,
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
    member: InstancedPokemonExt
  }): Promise<InstancedPokemonExt> {
    const { teamIndex, member } = params

    const request = this.#toUpsertTeamMemberRequest(member)

    const response = await serverAxios.put<UpsertTeamMemberResponse>(
      `team/member/${teamIndex}`,
      request
    )
    return this.#populateMember(response.data)
  }

  public async getTeams(): Promise<InstancedTeamExt[]> {
    const response = await serverAxios.get<GetTeamsResponse>('team')

    const existingTeams = response.data.teams
    const teamStore = useTeamStore()

    const teams: InstancedTeamExt[] = []
    for (let teamIndex = 0; teamIndex < teamStore.maxAvailableTeams; teamIndex++) {
      const existingTeam = existingTeams.find((team) => team.index === teamIndex)
      if (!existingTeam) {
        const emptyTeam: InstancedTeamExt = {
          index: teamIndex,
          name: `Helper team ${teamIndex + 1}`,
          camp: false,
          version: 0,
          members: new Array(MAX_TEAM_MEMBERS).fill(undefined)
        }
        teams.push(emptyTeam)
      } else {
        const members: (InstancedPokemonExt | undefined)[] = []
        for (let memberIndex = 0; memberIndex < MAX_TEAM_MEMBERS; memberIndex++) {
          const existingMember = existingTeam.members.find((member) => member.index === memberIndex)

          if (!existingMember) {
            members.push(undefined)
          } else {
            members.push(this.#populateMember(existingMember))
          }
        }

        const instancedTeam: InstancedTeamExt = {
          index: existingTeam.index,
          name: existingTeam.name,
          camp: existingTeam.camp,
          version: existingTeam.version,
          members
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

  #toUpsertTeamMemberRequest(instancedPokemon: InstancedPokemonExt): UpsertTeamMemberRequest {
    if (instancedPokemon.ingredients.length !== 3) {
      throw new Error('Received corrupt ingredient data')
    } else if (instancedPokemon.subskills.length > 5) {
      throw new Error('Received corrupt subskill data')
    }

    return {
      index: instancedPokemon.index,
      version: instancedPokemon.version,
      saved: instancedPokemon.saved,
      externalId: instancedPokemon.externalId,
      pokemon: instancedPokemon.pokemon.name,
      name: instancedPokemon.name,
      level: instancedPokemon.level,
      carrySize: instancedPokemon.carrySize,
      skillLevel: instancedPokemon.skillLevel,
      nature: instancedPokemon.nature.name,
      subskills: instancedPokemon.subskills.map((instancedSubskill) => ({
        level: instancedSubskill.level,
        subskill: instancedSubskill.subskill.name
      })),
      ingredients: instancedPokemon.ingredients.map((instancedIngredient) => ({
        level: instancedIngredient.level,
        ingredient: instancedIngredient.ingredient.name
      }))
    }
  }

  #populateMember(instancedPokemon: PokemonInstance): InstancedPokemonExt {
    if (instancedPokemon.ingredients.length !== 3) {
      throw new Error('Received corrupt ingredient data')
    } else if (instancedPokemon.subskills.length > 5) {
      throw new Error('Received corrupt subskill data')
    }

    return {
      index: instancedPokemon.index,
      version: instancedPokemon.version,
      saved: instancedPokemon.saved,
      externalId: instancedPokemon.externalId,
      pokemon: getPokemon(instancedPokemon.pokemon),
      name: instancedPokemon.name,
      level: instancedPokemon.level,
      carrySize: instancedPokemon.carrySize,
      skillLevel: instancedPokemon.skillLevel,
      nature: getNature(instancedPokemon.nature),
      subskills: instancedPokemon.subskills.map((instancedSubskill) => ({
        level: instancedSubskill.level,
        subskill: getSubskill(instancedSubskill.subskill)
      })),
      ingredients: instancedPokemon.ingredients.map((instancedIngredient) => ({
        level: instancedIngredient.level,
        ingredient: getIngredient(instancedIngredient.ingredient)
      }))
    }
  }
}

export const TeamService = new TeamServiceImpl()
