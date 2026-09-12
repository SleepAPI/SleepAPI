import serverAxios from '@/router/server-axios'
import { TeamService } from '@/services/team/team-service'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { mocks } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import MockAdapter from 'axios-mock-adapter'
import {
  BULBASAUR,
  CarrySizeUtils,
  DEFAULT_ISLAND,
  ingredient,
  MAX_TEAM_SIZE,
  nature,
  subskill,
  uuid,
  type CalculateIvResponse,
  type GetTeamResponse,
  type MemberProductionBase,
  type PokemonInstance,
  type TeamSettingsDto,
  type UpsertTeamMetaRequest
} from 'sleepapi-common'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let mockedServerAxios = new MockAdapter(serverAxios)

beforeEach(async () => {
  mockedServerAxios = new MockAdapter(serverAxios)
  uuid.v4 = vi.fn().mockReturnValue('0'.repeat(36))
})

afterEach(() => {
  vi.clearAllMocks()
  mockedServerAxios.reset()
})

describe('createOrUpdateTeam', () => {
  it('should call server to create team', async () => {
    const teamRequest: UpsertTeamMetaRequest = {
      name: 'some name',
      camp: false,
      bedtime: '21:30',
      wakeup: '06:00',
      recipeType: 'curry',
      island: {
        islandName: 'GGEX',
        favoredBerries: 'favoredBerries'
      }
    }

    mockedServerAxios.onPut('/team/meta/0').replyOnce(200, 'successful response')
    const res = await TeamService.createOrUpdateTeam(0, teamRequest)

    const calls = mockedServerAxios.history.put
    expect(calls).toHaveLength(1)

    const lastCall = calls[0]
    expect(lastCall.url).toBe('team/meta/0')
    expect(res).toMatchInlineSnapshot(`"successful response"`)
  })
})

describe('getTeams', () => {
  it('should call server to get teams', async () => {
    const mockTeamStore = useTeamStore()
    mockedServerAxios.onGet('/team').replyOnce(200, { teams: [] })

    const res = await TeamService.getTeams()

    const calls = mockedServerAxios.history.get
    expect(calls).toHaveLength(1)

    const lastCall = calls[0]
    expect(lastCall.url).toBe('team')
    expect(res).toHaveLength(mockTeamStore.maxAvailableTeams)
  })

  it('should return empty teams when no existing teams', async () => {
    const mockTeamStore = useTeamStore()

    mockedServerAxios.onGet('/team').replyOnce(200, { teams: [] })
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
        island: { ...DEFAULT_ISLAND },
        stockpiledBerries: [],
        stockpiledIngredients: [],
        version: 0,
        members: new Array(MAX_TEAM_SIZE).fill(undefined),
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
        island: { islandName: 'greengrass', favoredBerries: '' },
        stockpiledBerries: [],
        stockpiledIngredients: [],
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
              { level: 0, name: ingredient.FANCY_APPLE.name, amount: 2 },
              { level: 30, name: ingredient.FANCY_APPLE.name, amount: 5 },
              { level: 60, name: ingredient.FANCY_APPLE.name, amount: 7 }
            ],
            sneakySnacking: false
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
      island: { ...DEFAULT_ISLAND },
      stockpiledBerries: [],
      stockpiledIngredients: [],
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
      island: { islandName: 'greengrass', favoredBerries: '' },
      members: Array.from({ length: MAX_TEAM_SIZE }, (__, memberIndex) => ({
        version: 1,
        memberIndex,
        saved: false,
        externalId: uuid.v4(),
        pokemon: BULBASAUR.name,
        name: `Bubble`,
        level: 5,
        carrySize: 3,
        skillLevel: 2,
        nature: 'brave',
        subskills: [{ level: 10, subskill: subskill.HELPING_BONUS.name }],
        ingredients: [
          { level: 0, name: ingredient.FANCY_APPLE.name, amount: 2 },
          { level: 30, name: ingredient.FANCY_APPLE.name, amount: 5 },
          { level: 60, name: ingredient.FANCY_APPLE.name, amount: 7 }
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
        island: { ...DEFAULT_ISLAND },
        stockpiledBerries: [],
        stockpiledIngredients: [],
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
      rp: 437,
      saved: false,
      pokemon: BULBASAUR,
      name: `Bubble`,
      level: 5,
      carrySize: BULBASAUR.carrySize,
      skillLevel: 2,
      nature: nature.BRAVE,
      subskills: [{ level: 10, subskill: subskill.HELPING_BONUS }],
      ingredients: [
        { level: 0, ingredient: ingredient.FANCY_APPLE, amount: 2 },
        { level: 30, ingredient: ingredient.FANCY_APPLE, amount: 5 },
        { level: 60, ingredient: ingredient.FANCY_APPLE, amount: 7 }
      ]
    })
  })
})

describe('createOrUpdateMember', () => {
  it('should call server to create or update a member and return the updated member', async () => {
    const teamIndex = 0
    const memberIndex = 0
    const member: PokemonInstance = mocks.createMockPokemon()
    serverAxios.put = vi.fn().mockResolvedValueOnce({
      data: {
        index: 1,
        version: 1,
        saved: true,
        externalId: uuid.v4(),
        pokemon: BULBASAUR.name,
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
      carrySize: CarrySizeUtils.baseCarrySize(member.pokemon),
      skillLevel: member.skillLevel,
      nature: member.nature.name,
      subskills: member.subskills.map((subskill) => ({
        level: subskill.level,
        subskill: subskill.subskill.name
      })),
      ingredients: member.ingredients.map((ingredientSet) => ({
        level: ingredientSet.level,
        name: ingredientSet.ingredient.name,
        amount: ingredientSet.amount
      })),
      sneakySnacking: false
    })
  })

  it('should handle server error when updating a member', async () => {
    const teamIndex = 0
    const memberIndex = 0
    const member = mocks.createMockPokemon()
    serverAxios.put = vi.fn().mockRejectedValueOnce(new Error('Server error'))

    await expect(TeamService.createOrUpdateMember({ teamIndex, memberIndex, member })).rejects.toThrow('Server error')

    expect(serverAxios.put).toHaveBeenCalledWith(`team/${teamIndex}/member/${memberIndex}`, {
      version: member.version,
      saved: member.saved,
      shiny: member.shiny,
      externalId: member.externalId,
      pokemon: member.pokemon.name,
      ribbon: member.ribbon,
      name: member.name,
      level: member.level,
      carrySize: CarrySizeUtils.baseCarrySize(member.pokemon),
      skillLevel: member.skillLevel,
      nature: member.nature.name,
      subskills: member.subskills.map((subskill) => ({
        level: subskill.level,
        subskill: subskill.subskill.name
      })),
      ingredients: member.ingredients.map((ingredientSet) => ({
        level: ingredientSet.level,
        name: ingredientSet.ingredient.name,
        amount: ingredientSet.amount
      })),
      sneakySnacking: false
    })
  })
})

describe('removeMember', () => {
  it('should call server to delete a team member', async () => {
    mockedServerAxios.onDelete('/team/1/member/2').replyOnce(200, { message: 'successful response' })

    await TeamService.removeMember({ teamIndex: 1, memberIndex: 2 })

    const calls = mockedServerAxios.history.delete
    expect(calls).toHaveLength(1)

    const lastCall = calls[0]
    expect(lastCall.url).toBe('team/1/member/2')
  })
})

describe('deleteTeam', () => {
  it('shall call server to delete a team', async () => {
    mockedServerAxios.onDelete('/team/2').replyOnce(200, { message: 'successful response' })

    await TeamService.deleteTeam(2)

    const calls = mockedServerAxios.history.delete
    expect(calls).toHaveLength(1)

    const lastCall = calls[0]
    expect(lastCall.url).toBe('team/2')
  })
})

describe('calculateProduction', () => {
  it('should call server to calculate team production', async () => {
    const members: PokemonInstance[] = [mocks.createMockPokemon()]
    const settings: TeamSettingsDto = {
      camp: false,
      bedtime: '21:00',
      wakeup: '07:00',
      stockpiledIngredients: [],
      island: { ...DEFAULT_ISLAND }
    }

    mockedServerAxios.onPost('/calculator/team').replyOnce(200, {
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
      cooking: {
        score: 50,
        rank: 'S'
      }
    })

    const result = await TeamService.calculateProduction({ members, settings })

    const postCalls = mockedServerAxios.history.post
    expect(postCalls).toHaveLength(1)

    const lastPostCall = postCalls[0]
    expect(lastPostCall.url).toBe('/calculator/team')

    const requestData = JSON.parse(lastPostCall.data)
    expect(requestData).toEqual({
      members: members.map((member) => ({
        externalId: member.externalId,
        ribbon: member.ribbon,
        pokemon: member.pokemon.name,
        level: member.level,
        carrySize: CarrySizeUtils.baseCarrySize(member.pokemon),
        skillLevel: member.skillLevel,
        nature: member.nature.name,
        subskills: member.subskills.map((s) => ({ level: s.level, subskill: s.subskill.name })),
        ingredients: member.ingredients.map((i) => ({
          level: i.level,
          name: i.ingredient.name,
          amount: i.amount
        })),
        sneakySnacking: false
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

    const currentMember = mocks.createMockPokemon({ externalId: 'member1' })
    const otherMember = mocks.createMockPokemon({ externalId: 'member2' })

    teamStore.teams = createMockTeams(1, {
      members: [currentMember.externalId, otherMember.externalId]
    })

    pokemonStore.upsertLocalPokemon(currentMember)
    pokemonStore.upsertLocalPokemon(otherMember)

    const responseVariant: MemberProductionBase = {
      externalId: uuid.v4(),
      produceTotal: {
        berries: [{ amount: 10, berry: currentMember.pokemon.berry, level: 1 }],
        ingredients: []
      },
      skillProcs: 0,
      pokemonWithIngredients: {
        pokemon: currentMember.pokemon.name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ingredients: [] as any
      }
    }
    const response: CalculateIvResponse = {
      variants: [responseVariant]
    }

    mockedServerAxios.onPost('/calculator/iv').replyOnce(200, response)

    const result = await TeamService.calculateCurrentMemberIv()

    const postCalls = mockedServerAxios.history.post
    expect(postCalls).toHaveLength(1)
    const lastPostCall = postCalls[0]
    expect(lastPostCall.url).toBe('/calculator/iv')

    const requestData = JSON.parse(lastPostCall.data)
    expect(requestData).toEqual({
      members: [
        {
          externalId: 'member2',
          ribbon: otherMember.ribbon,
          pokemon: otherMember.pokemon.name,
          level: otherMember.level,
          carrySize: CarrySizeUtils.baseCarrySize(otherMember.pokemon),
          skillLevel: otherMember.skillLevel,
          nature: otherMember.nature.name,
          subskills: otherMember.subskills.map((s) => ({
            level: s.level,
            subskill: s.subskill.name
          })),
          ingredients: otherMember.ingredients.map((i) => ({
            level: i.level,
            name: i.ingredient.name,
            amount: i.amount
          })),
          sneakySnacking: false
        }
      ],
      variants: expect.any(Array),
      settings: {
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        stockpiledIngredients: [],
        island: mocks.islandInstance()
      }
    })

    expect(requestData.variants).toHaveLength(3)

    expect(result).toEqual({
      optimalBerry: responseVariant,
      optimalIngredient: responseVariant,
      optimalSkill: responseVariant
    })
  })
})
