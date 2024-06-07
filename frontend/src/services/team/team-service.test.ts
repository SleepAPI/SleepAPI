import serverAxios from '@/router/server-axios'
import { TeamService } from '@/services/team/team-service'
import { useTeamStore } from '@/stores/team/team-store'
import { MAX_TEAM_MEMBERS, type InstancedPokemonExt } from '@/types/member/instanced'
import { createPinia, setActivePinia } from 'pinia'
import {
  getIngredient,
  getNature,
  getPokemon,
  getSubskill,
  ingredient,
  nature,
  pokemon,
  subskill,
  uuid,
  type GetTeamResponse
} from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/router/server-axios', () => ({
  default: {
    put: vi.fn(() => ({ data: 'successful response' })),
    get: vi.fn(() => ({ data: { teams: [] } })),
    delete: vi.fn(() => undefined)
  }
}))

beforeEach(() => {
  uuid.v4 = vi.fn().mockReturnValue('0'.repeat(36))
})

describe('createOrUpdateTeam', () => {
  it('should call server to create team', async () => {
    const teamRequest = { name: 'some name', camp: false }
    const res = await TeamService.createOrUpdateTeam(0, teamRequest)

    expect(serverAxios.put).toHaveBeenCalledWith('team/meta/0', teamRequest)
    expect(res).toMatchInlineSnapshot(`"successful response"`)
  })
})

describe('getTeams', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
  })
  it('should call server to get teams', async () => {
    const mockTeamStore = useTeamStore()
    const res = await TeamService.getTeams()

    expect(serverAxios.get).toHaveBeenCalledWith('team')
    expect(res).toHaveLength(mockTeamStore.maxAvailableTeams)
  })

  it('should return empty teams when no existing teams', async () => {
    const mockTeamStore = useTeamStore()

    const res = await TeamService.getTeams()

    expect(res).toHaveLength(mockTeamStore.maxAvailableTeams)
    res.forEach((team, index) => {
      expect(team).toEqual({
        index,
        name: `Helper team ${index + 1}`,
        camp: false,
        version: 0,
        members: new Array(MAX_TEAM_MEMBERS).fill(undefined)
      })
    })
  })

  it('should return partially filled teams', async () => {
    const mockTeamStore = useTeamStore()
    const existingTeams: GetTeamResponse[] = [
      {
        index: 0,
        name: 'Team 1',
        camp: true,
        version: 1,
        members: [
          {
            index: 0,
            version: 0,
            saved: false,
            externalId: uuid.v4(),
            pokemon: 'bulbasaur',
            name: 'Bulbasaur',
            level: 5,
            carrySize: 3,
            skillLevel: 2,
            nature: 'brave',
            subskills: [],
            ingredients: [
              { level: 0, ingredient: 'apple' },
              { level: 30, ingredient: 'apple' },
              { level: 60, ingredient: 'apple' }
            ]
          }
        ]
      }
    ]

    serverAxios.get = vi.fn().mockResolvedValueOnce({ data: { teams: existingTeams } })

    const res = await TeamService.getTeams()

    expect(res[0]).toEqual({
      index: 0,
      name: 'Team 1',
      camp: true,
      version: 1,
      members: [
        {
          index: 0,
          version: 0,
          saved: false,
          externalId: '000000000000000000000000000000000000',
          pokemon: getPokemon('bulbasaur'),
          name: 'Bulbasaur',
          level: 5,
          carrySize: 3,
          skillLevel: 2,
          nature: getNature('brave'),
          subskills: [],
          ingredients: [
            { level: 0, ingredient: ingredient.FANCY_APPLE },
            { level: 30, ingredient: ingredient.FANCY_APPLE },
            { level: 60, ingredient: ingredient.FANCY_APPLE }
          ]
        },
        ...new Array(MAX_TEAM_MEMBERS - 1).fill(undefined)
      ]
    })

    for (let i = 1; i < mockTeamStore.maxAvailableTeams; i++) {
      expect(res[i]).toEqual({
        index: i,
        name: `Helper team ${i + 1}`,
        camp: false,
        version: 0,
        members: new Array(MAX_TEAM_MEMBERS).fill(undefined)
      })
    }
  })

  it('should return fully filled teams', async () => {
    const mockTeamStore = useTeamStore()
    const existingTeams = Array.from({ length: mockTeamStore.maxAvailableTeams }, (_, index) => ({
      index,
      name: `Team ${index + 1}`,
      camp: index % 2 === 0,
      version: 1,
      members: Array.from({ length: MAX_TEAM_MEMBERS }, (__, memberIndex) => ({
        index: memberIndex,
        saved: false,
        pokemon: 'bulbasaur',
        name: `Bulbasaur ${memberIndex}`,
        level: 5,
        carrySize: 3,
        skillLevel: 2,
        nature: 'brave',
        subskills: [{ level: 10, subskill: 'Helping Bonus' }],
        ingredients: [
          { level: 0, ingredient: 'apple' },
          { level: 30, ingredient: 'apple' },
          { level: 60, ingredient: 'apple' }
        ]
      }))
    }))

    serverAxios.get = vi.fn().mockResolvedValueOnce({ data: { teams: existingTeams } })

    const res = await TeamService.getTeams()

    res.forEach((team, teamIndex) => {
      expect(team).toEqual({
        index: teamIndex,
        name: `Team ${teamIndex + 1}`,
        camp: teamIndex % 2 === 0,
        version: 1,
        members: Array.from({ length: MAX_TEAM_MEMBERS }, (__, memberIndex) => ({
          index: memberIndex,
          saved: false,
          pokemon: pokemon.BULBASAUR,
          name: `Bulbasaur ${memberIndex}`,
          level: 5,
          carrySize: 3,
          skillLevel: 2,
          nature: nature.BRAVE,
          subskills: [{ level: 10, subskill: subskill.HELPING_BONUS }],
          ingredients: [
            { level: 0, ingredient: ingredient.FANCY_APPLE },
            { level: 30, ingredient: ingredient.FANCY_APPLE },
            { level: 60, ingredient: ingredient.FANCY_APPLE }
          ]
        }))
      })
    })
  })
})

describe('createOrUpdateMember', () => {
  it('should call server to create or update a member and return the updated member', async () => {
    const teamIndex = 0
    const member: InstancedPokemonExt = {
      index: 1,
      version: 1,
      saved: true,
      externalId: uuid.v4(),
      pokemon: pokemon.BULBASAUR,
      name: 'Bulbasaur',
      level: 5,
      carrySize: 3,
      skillLevel: 2,
      nature: nature.BRAVE,
      subskills: [{ level: 10, subskill: subskill.HELPING_BONUS }],
      ingredients: [
        { level: 0, ingredient: ingredient.FANCY_APPLE },
        { level: 30, ingredient: ingredient.FANCY_APPLE },
        { level: 60, ingredient: ingredient.FANCY_APPLE }
      ]
    }
    serverAxios.put = vi.fn().mockResolvedValueOnce({
      data: {
        index: 1,
        version: 1,
        saved: true,
        externalId: uuid.v4(),
        pokemon: pokemon.BULBASAUR.name,
        name: 'Bulbasaur',
        level: 5,
        carrySize: 3,
        skillLevel: 2,
        nature: nature.BRAVE.name,
        subskills: [{ level: 10, subskill: subskill.HELPING_BONUS.name }],
        ingredients: [
          { level: 0, ingredient: ingredient.FANCY_APPLE.name },
          { level: 30, ingredient: ingredient.FANCY_APPLE.name },
          { level: 60, ingredient: ingredient.FANCY_APPLE.name }
        ]
      }
    })

    const result = await TeamService.createOrUpdateMember({ teamIndex, member })

    expect(serverAxios.put).toHaveBeenCalledWith(`team/member/${teamIndex}`, {
      index: member.index,
      version: member.version,
      saved: member.saved,
      externalId: member.externalId,
      pokemon: member.pokemon.name,
      name: member.name,
      level: member.level,
      carrySize: member.carrySize,
      skillLevel: member.skillLevel,
      nature: member.nature.name,
      subskills: member.subskills.map((subskill) => ({
        level: subskill.level,
        subskill: subskill.subskill.name
      })),
      ingredients: member.ingredients.map((ingredient) => ({
        level: ingredient.level,
        ingredient: ingredient.ingredient.name
      }))
    })
    expect(result).toEqual(member)
  })

  it('should handle server error when updating a member', async () => {
    const teamIndex = 0
    const member = {
      index: 1,
      version: 1,
      saved: true,
      externalId: uuid.v4(),
      pokemon: getPokemon('bulbasaur'),
      name: 'Bulbasaur',
      level: 5,
      carrySize: 3,
      skillLevel: 2,
      nature: getNature('brave'),
      subskills: [{ level: 10, subskill: getSubskill('Helping Bonus') }],
      ingredients: [
        { level: 0, ingredient: getIngredient('apple') },
        { level: 30, ingredient: getIngredient('apple') },
        { level: 60, ingredient: getIngredient('apple') }
      ]
    }
    serverAxios.put = vi.fn().mockRejectedValueOnce(new Error('Server error'))

    await expect(TeamService.createOrUpdateMember({ teamIndex, member })).rejects.toThrow(
      'Server error'
    )

    expect(serverAxios.put).toHaveBeenCalledWith(`team/member/${teamIndex}`, {
      index: member.index,
      version: member.version,
      saved: member.saved,
      externalId: member.externalId,
      pokemon: member.pokemon.name,
      name: member.name,
      level: member.level,
      carrySize: member.carrySize,
      skillLevel: member.skillLevel,
      nature: member.nature.name,
      subskills: member.subskills.map((subskill) => ({
        level: subskill.level,
        subskill: subskill.subskill.name
      })),
      ingredients: member.ingredients.map((ingredient) => ({
        level: ingredient.level,
        ingredient: ingredient.ingredient.name
      }))
    })
  })
})

describe('removeMember', () => {
  it('should call server to delete a team member', async () => {
    await TeamService.removeMember({ teamIndex: 1, memberIndex: 2 })

    expect(serverAxios.delete).toHaveBeenCalledWith('team/1/member/2')
  })
})
