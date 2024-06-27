import serverAxios from '@/router/server-axios'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import {
  MAX_TEAM_MEMBERS,
  type TeamCombinedProduction,
  type TeamInstance,
  type TeamProduction
} from '@/types/member/instanced'
import axios from 'axios'
import {
  getIngredient,
  getNature,
  getPokemon,
  getSubskill,
  type CalculateTeamResponse,
  type GetTeamsResponse,
  type PokemonInstanceExt,
  type PokemonInstanceIdentity,
  type PokemonInstanceWithMeta,
  type TeamSettingsRequest,
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
    memberIndex: number
    member: PokemonInstanceExt
  }): Promise<PokemonInstanceExt> {
    const { teamIndex, memberIndex, member } = params

    const request = this.#toUpsertTeamMemberRequest(member)

    const response = await serverAxios.put<UpsertTeamMemberResponse>(
      `team/${teamIndex}/member/${memberIndex}`,
      request
    )
    return this.#populateMember(response.data)
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
            const cachedMember = this.#populateMember(existingMember)
            pokemonStore.upsertPokemon(cachedMember)
            members.push(cachedMember.externalId)
          }
        }

        const instancedTeam: TeamInstance = {
          index: existingTeam.index,
          name: existingTeam.name,
          camp: existingTeam.camp,
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
      skillLevel: member.skillLevel,
      externalId: member.externalId
    }))

    const response = await axios.post<CalculateTeamResponse>('/api/calculator/team', {
      members: parsedMembers,
      settings
    })

    // TODO: fix result parsing, also move out to function
    const teamProduction: TeamCombinedProduction = response.data.members.reduce(
      (sum, cur) =>
        (sum = {
          berries: (sum.berries += `\n${cur.berries}`),
          ingredients: (sum.ingredients += `\n${cur.ingredients}`)
        }),
      { berries: '', ingredients: '' }
    )

    const result: TeamProduction = {
      members: response.data.members.map((member) => {
        if (!member.externalId) {
          console.error('Unidentified member in team calculation, contact developer')
          throw new Error('Unidentified member in team calculation')
        }
        return {
          berries: member.berries,
          ingredients: member.ingredients,
          skillProcs: member.skillProcs,
          externalId: member.externalId
        }
      }),
      team: teamProduction
    }

    return result
  }

  #toUpsertTeamMemberRequest(instancedPokemon: PokemonInstanceExt): UpsertTeamMemberRequest {
    if (instancedPokemon.ingredients.length !== 3) {
      throw new Error('Received corrupt ingredient data')
    } else if (instancedPokemon.subskills.length > 5) {
      throw new Error('Received corrupt subskill data')
    }

    return {
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

  #populateMember(instancedPokemon: PokemonInstanceWithMeta): PokemonInstanceExt {
    if (instancedPokemon.ingredients.length !== 3) {
      throw new Error('Received corrupt ingredient data')
    } else if (instancedPokemon.subskills.length > 5) {
      throw new Error('Received corrupt subskill data')
    }

    return {
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
