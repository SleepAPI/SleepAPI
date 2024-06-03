import serverAxios from '@/router/server-axios'
import { TeamService } from '@/services/team/team-service'
import { useTeamStore } from '@/stores/team/team-store'
import { MAX_TEAM_MEMBERS } from '@/types/instanced'
import { createPinia, setActivePinia } from 'pinia'
import {
  getNature,
  getPokemon,
  ingredient,
  nature,
  pokemon,
  subskill,
  type GetTeamResponse
} from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/router/server-axios', () => ({
  default: {
    put: vi.fn(() => ({ data: 'successful response' })),
    get: vi.fn(() => ({ data: { teams: [] } }))
  }
}))

describe('createOrUpdateTeam', () => {
  it('should call server to create team', async () => {
    const teamRequest = { name: 'some name', camp: false }
    const res = await TeamService.createOrUpdateTeam(0, teamRequest)

    expect(serverAxios.put).toHaveBeenCalledWith('team/0', teamRequest)
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
            saved: false,
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
          saved: false,
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
