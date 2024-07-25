import { TeamService } from '@/services/team/team-service'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { createPinia, setActivePinia } from 'pinia'
import { ingredient, nature, pokemon, uuid, type PokemonInstanceExt } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/team/team-service', () => ({
  TeamService: {
    getTeams: vi.fn(),
    createOrUpdateTeam: vi.fn(),
    createOrUpdateMember: vi.fn(),
    calculateProduction: vi.fn()
  }
}))

describe('Team Store', () => {
  const externalId = 'external-id'
  const mockPokemon: PokemonInstanceExt = {
    name: 'Bubbles',
    externalId,
    pokemon: pokemon.PIKACHU,
    carrySize: 10,
    ingredients: [{ level: 1, ingredient: ingredient.FANCY_APPLE }],
    level: 10,
    ribbon: 0,
    nature: nature.BASHFUL,
    saved: false,
    shiny: false,
    skillLevel: 1,
    subskills: [],
    version: 1
  }

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have expected default state', () => {
    const teamStore = useTeamStore()
    expect(teamStore.$state).toMatchInlineSnapshot(`
      {
        "currentIndex": 0,
        "domainVersion": 0,
        "loadingMembers": [
          false,
          false,
          false,
          false,
          false,
        ],
        "loadingTeams": true,
        "maxAvailableTeams": 5,
        "teams": [
          {
            "bedtime": "21:30",
            "camp": false,
            "index": 0,
            "members": [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ],
            "name": "Log in to save your teams",
            "production": undefined,
            "version": 0,
            "wakeup": "06:00",
          },
        ],
      }
    `)
  })

  it('should populate teams correctly when user is logged in', async () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()
    userStore.setTokens({
      accessToken: 'token1',
      expiryDate: 10,
      refreshToken: 'token2'
    })

    const pokemonStore = usePokemonStore()
    pokemonStore.upsertPokemon(mockPokemon)
    teamStore.teams = [
      {
        index: 0,
        name: 'Team 1',
        camp: true,
        bedtime: '21:30',
        wakeup: '06:00',
        version: 0,
        members: ['Old member 1', undefined, undefined, undefined, undefined],
        production: undefined
      },
      {
        index: 1,
        name: 'Team 2',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        version: 0,
        members: [undefined, undefined, undefined, undefined, undefined],
        production: undefined
      }
    ]

    TeamService.getTeams = vi.fn().mockResolvedValue([
      {
        index: 0,
        name: 'Team 1',
        camp: true,
        version: 1, // will cause re-sim to be called
        members: [externalId, undefined, undefined, undefined, undefined],
        production: undefined
      },
      {
        index: 1,
        name: 'Team 2',
        camp: false,
        version: 0,
        members: [undefined, undefined, undefined, undefined, undefined],
        production: undefined
      }
    ])

    TeamService.calculateProduction = vi.fn().mockResolvedValue({
      team: {
        berries: 'Some berries',
        ingredients: 'Some ingredients'
      },
      members: [
        {
          berries: 'Member berry',
          ingredients: 'Member ings',
          skillProcs: 'Member procs',
          externalId: 'Some id'
        }
      ]
    })

    await teamStore.populateTeams()

    expect(TeamService.getTeams).toHaveBeenCalled()
    expect(TeamService.calculateProduction).toHaveBeenCalled()
    expect(teamStore.$state.teams).toMatchInlineSnapshot(`
      [
        {
          "camp": true,
          "index": 0,
          "members": [
            "external-id",
            undefined,
            undefined,
            undefined,
            undefined,
          ],
          "name": "Team 1",
          "production": {
            "members": [
              {
                "berries": "Member berry",
                "externalId": "Some id",
                "ingredients": "Member ings",
                "skillProcs": "Member procs",
              },
            ],
            "team": {
              "berries": "Some berries",
              "ingredients": "Some ingredients",
            },
          },
          "version": 1,
        },
        {
          "camp": false,
          "index": 1,
          "members": [
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
          ],
          "name": "Team 2",
          "production": undefined,
          "version": 0,
        },
      ]
    `)
  })

  it('should set loadingTeams to false if user is not logged in', async () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()
    userStore.tokens = null

    await teamStore.populateTeams()

    expect(teamStore.loadingTeams).toBeFalsy()
    expect(teamStore.$state.teams[0].name).toBe('Log in to save your teams')
  })

  it('should reset the state correctly', () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      {
        index: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [],
        version: 1,
        production: undefined
      },
      {
        index: 1,
        name: 'Team 2',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [],
        version: 1,
        production: undefined
      }
    ]
    teamStore.currentIndex = 1
    teamStore.maxAvailableTeams = 4
    teamStore.loadingTeams = false

    teamStore.reset()

    expect(teamStore.$state).toMatchInlineSnapshot(`
      {
        "currentIndex": 0,
        "domainVersion": 0,
        "loadingMembers": [
          false,
          false,
          false,
          false,
          false,
        ],
        "loadingTeams": true,
        "maxAvailableTeams": 5,
        "teams": [
          {
            "bedtime": "21:30",
            "camp": false,
            "index": 0,
            "members": [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ],
            "name": "Log in to save your teams",
            "production": undefined,
            "version": 0,
            "wakeup": "06:00",
          },
        ],
      }
    `)
  })

  it('should increment currentIndex correctly on next()', () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      {
        index: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [],
        version: 1,
        production: undefined
      },
      {
        index: 1,
        name: 'Team 2',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [],
        version: 1,
        production: undefined
      }
    ]

    teamStore.next()
    expect(teamStore.currentIndex).toBe(1)

    teamStore.next()
    expect(teamStore.currentIndex).toBe(0)
  })

  it('should decrement currentIndex correctly on prev()', () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      {
        index: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [],
        version: 1,
        production: undefined
      },
      {
        index: 1,
        name: 'Team 2',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [],
        version: 1,
        production: undefined
      }
    ]

    teamStore.prev()
    expect(teamStore.currentIndex).toBe(1)

    teamStore.prev()
    expect(teamStore.currentIndex).toBe(0)
  })

  it('should duplicate member to the first open slot', async () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()
    const pokemonStore = usePokemonStore()

    userStore.setTokens({
      accessToken: 'token1',
      expiryDate: 10,
      refreshToken: 'token2'
    })
    teamStore.teams = [
      {
        index: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [undefined, externalId, undefined, undefined, undefined],
        version: 1,
        production: undefined
      }
    ]
    pokemonStore.upsertPokemon(mockPokemon)

    TeamService.createOrUpdateMember = vi.fn().mockResolvedValue({ index: 0, name: 'Pikachu' })

    await teamStore.duplicateMember(1)

    expect(teamStore.teams[0].members[0]).toBeDefined()
    expect(teamStore.teams[0].members[2]).toBeUndefined()
    expect(teamStore.teams[0].members[3]).toBeUndefined()
    expect(teamStore.teams[0].members[4]).toBeUndefined()
    expect(TeamService.createOrUpdateMember).toHaveBeenCalled()
  })

  it('should not duplicate if no open slot is available', async () => {
    const teamStore = useTeamStore()
    const member = uuid.v4()

    teamStore.teams = [
      {
        index: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [member, member, member, member, member],
        version: 1,
        production: undefined
      }
    ]

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await teamStore.duplicateMember(1)

    expect(consoleSpy).toHaveBeenCalledWith("No open slot or member can't be found")
    consoleSpy.mockRestore()
  })

  it('should not duplicate if member does not exist', async () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      {
        index: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [undefined, undefined, undefined, undefined, undefined],
        version: 1,
        production: undefined
      }
    ]

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await teamStore.duplicateMember(1)

    expect(consoleSpy).toHaveBeenCalledWith("No open slot or member can't be found")
    consoleSpy.mockRestore()
  })

  it('should remove member', async () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()

    userStore.setTokens({
      accessToken: 'token1',
      expiryDate: 10,
      refreshToken: 'token2'
    })

    const member2 = uuid.v4()
    const member4 = uuid.v4()
    teamStore.teams = [
      {
        index: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [undefined, member2, undefined, member4, undefined],
        version: 1,
        production: undefined
      }
    ]

    TeamService.removeMember = vi.fn().mockResolvedValue(undefined)

    await teamStore.removeMember(1)

    expect(teamStore.teams[0].members).toEqual([
      undefined,
      undefined,
      undefined,
      member4,
      undefined
    ])
    expect(TeamService.removeMember).toHaveBeenCalledWith({
      teamIndex: 0,
      memberIndex: 1
    })
  })

  it('should get number of members in team', async () => {
    const teamStore = useTeamStore()

    const member = { name: 'Pikachu' } as PokemonInstanceExt
    teamStore.teams = [
      {
        index: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [undefined, member, null as any, member, '' as any],
        version: 1,
        production: undefined
      }
    ]

    const size = teamStore.getTeamSize
    expect(size).toBe(2)
  })
})
