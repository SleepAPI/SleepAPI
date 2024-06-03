import serverAxios from '@/router/server-axios'
import { useTeamStore } from '@/stores/team/team-store'
import {
  MAX_TEAM_MEMBERS,
  type InstancedPokemonExt,
  type InstancedTeamExt
} from '@/types/instanced'
import {
  getIngredient,
  getNature,
  getPokemon,
  getSubskill,
  type GetTeamsResponse,
  type InstancedPokemon,
  type PutTeamRequest,
  type PutTeamResponse
} from 'sleepapi-common'

class TeamServiceImpl {
  public async createOrUpdateTeam(index: number, teamInfo: PutTeamRequest) {
    const response = await serverAxios.put<PutTeamResponse>(`team/${index}`, teamInfo)

    return response.data
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

  #populateMember(instancedPokemon: InstancedPokemon): InstancedPokemonExt {
    if (instancedPokemon.ingredients.length !== 3) {
      throw new Error('Received corrupt ingredient data')
    } else if (instancedPokemon.subskills.length > 5) {
      throw new Error('Received corrupt subskill data')
    }

    return {
      index: instancedPokemon.index,
      saved: instancedPokemon.saved,
      pokemon: getPokemon(instancedPokemon.pokemon),
      name: instancedPokemon.name,
      level: instancedPokemon.level,
      carryLimit: instancedPokemon.carryLimit,
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
