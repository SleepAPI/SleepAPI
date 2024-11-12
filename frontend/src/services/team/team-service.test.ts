import serverAxios from '@/router/server-axios'
import { TeamService } from '@/services/team/team-service'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { MAX_TEAM_MEMBERS } from '@/types/member/instanced'
import { createMockPokemon } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import {
  ingredient,
  nature,
  pokemon,
  subskill,
  uuid,
  type CalculateIvResponse,
  type GetTeamResponse,
  type PokemonInstanceExt,
  type UpsertTeamMetaRequest
} from 'sleepapi-common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

vi.mock('@/router/server-axios', () => ({
  default: {
    put: vi.fn(() => ({ data: 'successful response' })),
    get: vi.fn(() => ({ data: { teams: [] } })),
    delete: vi.fn(() => undefined)
  }
}))

beforeEach(async () => {
  setActivePinia(createPinia())
  uuid.v4 = vi.fn().mockReturnValue('0'.repeat(36))
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('createOrUpdateTeam', () => {
  it('should call server to create team', async () => {
    const teamRequest: UpsertTeamMetaRequest = {
      name: 'some name',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipeType: 'curry'
    }
    const res = await TeamService.createOrUpdateTeam(0, teamRequest)

    expect(serverAxios.put).toHaveBeenCalledWith('team/meta/0', teamRequest)
    expect(res).toMatchInlineSnapshot(`"successful response"`)
  })
})

describe('getTeams', () => {
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
        memberIndex: 0,
        name: `Helper team ${index + 1}`,
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        version: 0,
        members: new Array(MAX_TEAM_MEMBERS).fill(undefined),
        memberIvs: {}
      })
    })
  })

  it('should return partially filled teams', async () => {
    const existingTeams: GetTeamResponse[] = [
      {
        index: 0,
        name: 'Team 1',
        camp: true,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        version: 1,
        members: [
          {
            memberIndex: 0,
            version: 0,
            saved: false,
            shiny: false,
            gender: 'female',
            externalId: uuid.v4(),
            pokemon: 'bulbasaur',
            name: 'Bulbasaur',
            level: 5,
            ribbon: 0,
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
      memberIndex: 0,
      name: 'Team 1',
      camp: true,
      bedtime: '21:30',
      wakeup: '06:00',
      recipeType: 'curry',
      favoredBerries: [],
      version: 1,
      members: [existingTeams[0].members[0].externalId, undefined, undefined, undefined, undefined],
      memberIvs: {}
    })
  })

  it('should return fully filled teams', async () => {
    const mockTeamStore = useTeamStore()
    const existingTeams = Array.from({ length: mockTeamStore.maxAvailableTeams }, (_, index) => ({
      index,
      name: `Team ${index + 1}`,
      camp: index % 2 === 0,
      version: 1,
      recipeType: 'curry',
      favoredBerries: [],
      members: Array.from({ length: MAX_TEAM_MEMBERS }, (__, memberIndex) => ({
        version: 1,
        memberIndex,
        saved: false,
        externalId: uuid.v4(),
        pokemon: 'bulbasaur',
        name: `Bubble`,
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
        memberIndex: 0,
        name: `Team ${teamIndex + 1}`,
        camp: teamIndex % 2 === 0,
        version: 1,
        recipeType: 'curry',
        favoredBerries: [],
        members: [
          '000000000000000000000000000000000000',
          '000000000000000000000000000000000000',
          '000000000000000000000000000000000000',
          '000000000000000000000000000000000000',
          '000000000000000000000000000000000000'
        ],
        memberIvs: {}
      })
    })
    const pokemonStore = usePokemonStore()
    expect(pokemonStore.getPokemon('000000000000000000000000000000000000')).toEqual({
      version: 1,
      externalId: '000000000000000000000000000000000000',
      rp: 463,
      saved: false,
      pokemon: pokemon.BULBASAUR,
      name: `Bubble`,
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
    })
  })
})

describe('createOrUpdateMember', () => {
  it('should call server to create or update a member and return the updated member', async () => {
    const teamIndex = 0
    const memberIndex = 0
    const member: PokemonInstanceExt = createMockPokemon()
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

    await TeamService.createOrUpdateMember({ teamIndex, memberIndex, member })

    expect(serverAxios.put).toHaveBeenCalledWith(`team/${teamIndex}/member/${memberIndex}`, {
      version: member.version,
      saved: member.saved,
      shiny: member.shiny,
      externalId: member.externalId,
      pokemon: member.pokemon.name,
      ribbon: member.ribbon,
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

  it('should handle server error when updating a member', async () => {
    const teamIndex = 0
    const memberIndex = 0
    const member = createMockPokemon()
    serverAxios.put = vi.fn().mockRejectedValueOnce(new Error('Server error'))

    await expect(
      TeamService.createOrUpdateMember({ teamIndex, memberIndex, member })
    ).rejects.toThrow('Server error')

    expect(serverAxios.put).toHaveBeenCalledWith(`team/${teamIndex}/member/${memberIndex}`, {
      version: member.version,
      saved: member.saved,
      shiny: member.shiny,
      externalId: member.externalId,
      pokemon: member.pokemon.name,
      ribbon: member.ribbon,
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

describe('deleteTeam', () => {
  it('shall call server to delete a team', async () => {
    await TeamService.deleteTeam(2)

    expect(serverAxios.delete).toHaveBeenCalledWith('team/2')
  })
})

describe('calculateProduction', () => {
  it('should call server to calculate team production', async () => {
    const members: PokemonInstanceExt[] = [createMockPokemon()]
    const settings = {
      camp: false,
      bedtime: '21:00',
      wakeup: '07:00'
    }

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        members: [
          {
            produceTotal: {
              berries: [
                { amount: 10, berry: { name: 'Oran', type: 'normal', value: 5 }, level: 5 }
              ],
              ingredients: [
                {
                  amount: 3,
                  ingredient: {
                    longName: 'Honey',
                    name: 'Honey',
                    taxedValue: 10,
                    value: 15
                  }
                }
              ]
            }
          }
        ],
        cooking: {
          score: 50,
          rank: 'S'
        }
      }
    })

    const result = await TeamService.calculateProduction({ members, settings })

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/calculator/team', {
      members: members.map((member) => ({
        externalId: member.externalId,
        ribbon: member.ribbon,
        pokemon: member.pokemon.name,
        level: member.level,
        carrySize: member.carrySize,
        skillLevel: member.skillLevel,
        nature: member.nature.name,
        subskills: member.subskills.map((s) => ({ level: s.level, subskill: s.subskill.name })),
        ingredients: member.ingredients.map((i) => ({
          level: i.level,
          ingredient: i.ingredient.name
        }))
      })),
      settings
    })

    expect(result).toEqual({
      members: [
        {
          produceTotal: {
            berries: [{ amount: 10, berry: { name: 'Oran', type: 'normal', value: 5 }, level: 5 }],
            ingredients: [
              {
                amount: 3,
                ingredient: {
                  longName: 'Honey',
                  name: 'Honey',
                  taxedValue: 10,
                  value: 15
                }
              }
            ]
          }
        }
      ],
      team: {
        berries: [{ amount: 10, berry: { name: 'Oran', type: 'normal', value: 5 }, level: 5 }],
        ingredients: [
          {
            amount: 3,
            ingredient: {
              longName: 'Honey',
              name: 'Honey',
              taxedValue: 10,
              value: 15
            }
          }
        ],
        cooking: {
          score: 50,
          rank: 'S'
        }
      }
    })
  })
})

describe('calculateIv', () => {
  it('should calculate IV for the current team member', async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()

    const currentMember = createMockPokemon({ externalId: 'member1' })
    const otherMember = createMockPokemon({ externalId: 'member2' })

    teamStore.teams = createMockTeams(1, {
      members: [currentMember.externalId, otherMember.externalId]
    })

    pokemonStore.upsertLocalPokemon(currentMember)
    pokemonStore.upsertLocalPokemon(otherMember)

    const responseVariant =
      // uuid.v4() is mocked to 0 repeat x36
      {
        externalId: uuid.v4(),
        produceTotal: {
          berries: [{ amount: 10, berry: currentMember.pokemon.berry, level: 1 }],
          ingredients: []
        },
        skillProcs: 0
      }
    const response: CalculateIvResponse = {
      variants: [responseVariant]
    }

    mockedAxios.post.mockResolvedValue({
      data: {
        ...response
      }
    })

    const result = await TeamService.calculateCurrentMemberIv()

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/calculator/iv', {
      members: [
        {
          externalId: 'member2',
          ribbon: otherMember.ribbon,
          pokemon: otherMember.pokemon.name,
          level: otherMember.level,
          carrySize: otherMember.carrySize,
          skillLevel: otherMember.skillLevel,
          nature: otherMember.nature.name,
          subskills: otherMember.subskills.map((s) => ({
            level: s.level,
            subskill: s.subskill.name
          })),
          ingredients: otherMember.ingredients.map((i) => ({
            level: i.level,
            ingredient: i.ingredient.name
          }))
        }
      ],
      variants: expect.any(Array),
      settings: {
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00'
      }
    })

    const [[, requestData]]: any = mockedAxios.post.mock.calls
    expect(requestData.variants).toHaveLength(3)

    expect(result).toEqual({
      optimalBerry: responseVariant,
      optimalIngredient: responseVariant,
      optimalSkill: responseVariant
    })
  })
})
