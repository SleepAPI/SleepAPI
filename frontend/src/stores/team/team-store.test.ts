import { TeamService } from '@/services/team/team-service'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import type { TeamInstance } from '@/types/member/instanced'
import { createMockMemberProduction, createMockPokemon, createMockTeamProduction } from '@/vitest'
import { createMockTeams } from '@/vitest/mocks/calculator/team-instance'
import { createPinia, setActivePinia } from 'pinia'
import { berry, pokemon, subskill, uuid, type PokemonInstanceExt } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('@/services/team/team-service', () => ({
  TeamService: {
    getTeams: vi.fn(),
    deleteTeam: vi.fn(),
    createOrUpdateTeam: vi.fn(),
    createOrUpdateMember: vi.fn(),
    calculateProduction: vi.fn()
  }
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Team Store', () => {
  const externalId = 'external-id'
  const mockPokemon = createMockPokemon()

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
        "loadingTeams": false,
        "maxAvailableTeams": 10,
        "tab": "overview",
        "teams": [
          {
            "bedtime": "21:30",
            "camp": false,
            "favoredBerries": [],
            "index": 0,
            "memberIndex": 0,
            "members": [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ],
            "name": "Log in to save your teams",
            "production": undefined,
            "recipeType": "curry",
            "version": 0,
            "wakeup": "06:00",
          },
        ],
        "timeWindow": "24H",
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
    pokemonStore.upsertLocalPokemon(mockPokemon)
    teamStore.teams = createMockTeams(2)

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

    await teamStore.syncTeams()

    expect(TeamService.getTeams).toHaveBeenCalled()
    teamStore.teams.forEach((team) => expect(team.production).toBeUndefined())
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
          "production": undefined,
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

  it('should reset the state correctly', async () => {
    const teamStore = useTeamStore()
    teamStore.teams = createMockTeams(2)

    teamStore.currentIndex = 1
    teamStore.maxAvailableTeams = 4
    teamStore.loadingTeams = false

    teamStore.$reset()

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
        "loadingTeams": false,
        "maxAvailableTeams": 10,
        "tab": "overview",
        "teams": [
          {
            "bedtime": "21:30",
            "camp": false,
            "favoredBerries": [],
            "index": 0,
            "memberIndex": 0,
            "members": [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ],
            "name": "Log in to save your teams",
            "production": undefined,
            "recipeType": "curry",
            "version": 0,
            "wakeup": "06:00",
          },
        ],
        "timeWindow": "24H",
      }
    `)
  })

  it('should increment currentIndex correctly on next()', () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      {
        index: 0,
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [],
        version: 1,
        recipeType: 'curry',
        favoredBerries: [],
        production: undefined
      },
      {
        index: 1,
        memberIndex: 0,
        name: 'Team 2',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        members: [],
        version: 1,
        recipeType: 'curry',
        favoredBerries: [],
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
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        members: [],
        version: 1,
        production: undefined
      },
      {
        index: 1,
        memberIndex: 0,
        name: 'Team 2',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
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

  it('should get number of members in team', async () => {
    const teamStore = useTeamStore()

    const member = { name: 'Pikachu' } as PokemonInstanceExt
    teamStore.teams = [
      {
        index: 0,
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        members: [undefined, member, null as any, member, '' as any],
        version: 1,
        production: undefined
      }
    ]

    const size = teamStore.getTeamSize
    expect(size).toBe(2)
  })

  it('deleteTeam shall reset current team', () => {
    const teamStore = useTeamStore()

    const team1: TeamInstance = {
      index: 0,
      memberIndex: 1,
      name: 'Team 1',
      camp: false,
      bedtime: '21:10',
      wakeup: '06:00',
      recipeType: 'curry',
      favoredBerries: [],
      members: [undefined, 'member1', undefined, 'member2', undefined],
      version: 1,
      production: undefined
    }
    const team2: TeamInstance = {
      index: 0,
      memberIndex: 0,
      name: 'Team 2',
      camp: false,
      bedtime: '21:20',
      wakeup: '06:00',
      recipeType: 'curry',
      favoredBerries: [],
      members: [undefined, 'member3', undefined, 'member4', undefined],
      version: 1,
      production: undefined
    }
    teamStore.teams = [team1, team2]
    teamStore.currentIndex = 1

    teamStore.deleteTeam()

    expect(teamStore.teams[0]).toEqual(team1)
    expect(teamStore.getCurrentTeam).toMatchInlineSnapshot(`
      {
        "bedtime": "21:30",
        "camp": false,
        "favoredBerries": [],
        "index": 1,
        "memberIndex": 0,
        "members": [
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        ],
        "name": "Log in to save your teams",
        "production": undefined,
        "recipeType": "curry",
        "version": 0,
        "wakeup": "06:00",
      }
    `)
  })

  it('deleteTeam shall call server to delete team if user logged in', () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()

    userStore.setTokens({ accessToken: 'at', expiryDate: 0, refreshToken: 'rt' })

    const team1: TeamInstance = {
      index: 0,
      memberIndex: 0,
      name: 'Team 1',
      camp: false,
      bedtime: '21:10',
      wakeup: '06:00',
      recipeType: 'curry',
      favoredBerries: [],
      members: [undefined, 'member1', undefined, 'member2', undefined],
      version: 1,
      production: undefined
    }

    teamStore.teams = [team1]
    teamStore.currentIndex = 0

    teamStore.deleteTeam()

    expect(TeamService.deleteTeam).toHaveBeenCalled()
  })
})

describe('duplicateMember', () => {
  const mockPokemon = createMockPokemon()

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
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
        members: [undefined, mockPokemon.externalId, undefined, undefined, undefined],
        version: 1,
        production: undefined
      }
    ]
    pokemonStore.upsertLocalPokemon(mockPokemon)

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
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
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
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
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
})

describe('removeMember', () => {
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
        memberIndex: 0,
        name: 'Team 1',
        camp: false,
        bedtime: '21:30',
        wakeup: '06:00',
        recipeType: 'curry',
        favoredBerries: [],
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

  it("should reset every member's single production if member was support mon", async () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    teamStore.resetCurrentTeamSingleProduction = vi.fn()

    const mockPokemon1 = createMockPokemon()
    const mockPokemon2 = createMockPokemon({ pokemon: pokemon.WIGGLYTUFF })
    pokemonStore.upsertLocalPokemon(mockPokemon1)
    pokemonStore.upsertLocalPokemon(mockPokemon2)

    teamStore.teams = createMockTeams(1, {
      members: [mockPokemon1.externalId, mockPokemon2.externalId]
    })

    await teamStore.removeMember(1)
    expect(teamStore.resetCurrentTeamSingleProduction).toHaveBeenCalled()
  })
})

describe('calculateProduction', () => {
  it('shall preserve single production', async () => {
    const teamStore = useTeamStore()
    teamStore.teams = createMockTeams()

    TeamService.calculateProduction = vi.fn().mockResolvedValue(
      createMockTeamProduction({
        members: [createMockMemberProduction({ singleProduction: undefined })]
      })
    )

    expect(teamStore.getCurrentTeam.production?.members[0].singleProduction).toBeDefined()
    await teamStore.calculateProduction(0)
    expect(teamStore.getCurrentTeam.production?.members[0].singleProduction).toBeDefined()
  })
})

describe('updateTeamMember', () => {
  it('shall upsert local pokemon and calculate production', () => {
    const teamStore = useTeamStore()
    const pokemonStore = usePokemonStore()
    pokemonStore.upsertLocalPokemon = vi.fn()

    teamStore.calculateProduction = vi.fn()
    teamStore.updateTeamMember(createMockPokemon(), 2)

    expect(teamStore.calculateProduction).toHaveBeenCalled()
    expect(pokemonStore.upsertLocalPokemon).toHaveBeenCalled()
    expect(teamStore.getCurrentTeam.members).toMatchInlineSnapshot(`
      [
        undefined,
        undefined,
        "external-id",
        undefined,
        undefined,
      ]
    `)
  })

  it('shall reset the single production', () => {
    const teamStore = useTeamStore()

    teamStore.teams = createMockTeams()

    expect(teamStore.teams).toHaveLength(1)
    expect(teamStore.teams[0].production?.members).toHaveLength(1)
    expect(teamStore.teams[0].production?.members[0].singleProduction).toBeDefined()

    teamStore.updateTeamMember(createMockPokemon(), 0)

    expect(teamStore.teams).toHaveLength(1)
    expect(teamStore.teams[0].production?.members).toHaveLength(1)
    expect(teamStore.teams[0].production?.members[0].singleProduction).toBeUndefined()
  })

  it("shall reset every member's single production for support mons", () => {
    const teamStore = useTeamStore()

    teamStore.resetCurrentTeamSingleProduction = vi.fn()
    teamStore.calculateProduction = vi.fn()
    teamStore.updateTeamMember(createMockPokemon({ pokemon: pokemon.WIGGLYTUFF }), 2)

    expect(teamStore.resetCurrentTeamSingleProduction).toHaveBeenCalled()
    expect(teamStore.calculateProduction).toHaveBeenCalled()
  })
  it("shall reset every member's single production if mon has support subskill", () => {
    const teamStore = useTeamStore()

    teamStore.resetCurrentTeamSingleProduction = vi.fn()
    teamStore.calculateProduction = vi.fn()
    teamStore.updateTeamMember(
      createMockPokemon({ subskills: [{ level: 10, subskill: subskill.HELPING_BONUS }] }),
      2
    )

    expect(teamStore.resetCurrentTeamSingleProduction).toHaveBeenCalled()
    expect(teamStore.calculateProduction).toHaveBeenCalled()
  })
})

describe('timewindowDivider', () => {
  it('shall return 1 for 24H', () => {
    const teamStore = useTeamStore()

    teamStore.timeWindow = '24H'
    expect(teamStore.timewindowDivider).toBe(1)
  })

  it('shall return 3 for 8H', () => {
    const teamStore = useTeamStore()

    teamStore.timeWindow = '8H'
    expect(teamStore.timewindowDivider).toBe(3)
  })
})

describe('migrate', () => {
  it('shall migrate old teams to new state', () => {
    const teamStore = useTeamStore()

    const team1: any = {
      index: 0,
      name: 'Team 1',
      camp: false,
      bedtime: '21:10',
      wakeup: '06:00',
      recipeType: 'curry',
      favoredBerries: [],
      members: [undefined, 'member1', undefined, 'member2', undefined],
      version: 1,
      production: undefined
    }
    const team2: any = {
      ...team1,
      name: 'Team 2',
      bedtime: '21:20',
      members: [undefined, 'member3', undefined, 'member4', undefined]
    }
    teamStore.teams = [team1, team2]
    teamStore.timeWindow = undefined as any
    teamStore.tab = null as any

    teamStore.migrate()

    expect(teamStore.tab).toEqual('overview')
    expect(teamStore.timeWindow).toEqual('24H')
    expect(teamStore.teams).toMatchSnapshot()
  })
})

describe('toggleCamp', () => {
  it('shall toggle camp and update production', async () => {
    const teamStore = useTeamStore()
    teamStore.teams = createMockTeams(1, { camp: false })

    teamStore.resetCurrentTeamSingleProduction = vi.fn()
    teamStore.updateTeam = vi.fn()
    teamStore.calculateProduction = vi.fn()

    expect(teamStore.getCurrentTeam.camp).toBe(false)
    await teamStore.toggleCamp()
    expect(teamStore.getCurrentTeam.camp).toBe(true)

    expect(teamStore.resetCurrentTeamSingleProduction).toHaveBeenCalled()
    expect(teamStore.updateTeam).toHaveBeenCalled()
    expect(teamStore.calculateProduction).toHaveBeenCalled()
  })
})

describe('updateSleep', () => {
  it('shall update sleep and update production', async () => {
    const teamStore = useTeamStore()
    teamStore.teams = createMockTeams(1, { bedtime: '22:00', wakeup: '05:00' })

    teamStore.resetCurrentTeamSingleProduction = vi.fn()
    teamStore.updateTeam = vi.fn()
    teamStore.calculateProduction = vi.fn()

    await teamStore.updateSleep({ bedtime: '23:00', wakeup: '07:00' })
    expect(teamStore.getCurrentTeam.bedtime).toEqual('23:00')
    expect(teamStore.getCurrentTeam.wakeup).toEqual('07:00')

    expect(teamStore.resetCurrentTeamSingleProduction).toHaveBeenCalled()
    expect(teamStore.updateTeam).toHaveBeenCalled()
    expect(teamStore.calculateProduction).toHaveBeenCalled()
  })
})

describe('updateFavoredBerries', () => {
  it('updateFavoredBerries shall update berries and call server', async () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()

    userStore.setTokens({ accessToken: 'at', expiryDate: 0, refreshToken: 'rt' })
    await nextTick()

    teamStore.updateTeam = vi.fn()

    await teamStore.updateFavoredBerries([berry.BELUE])
    expect(teamStore.getCurrentTeam.favoredBerries).toEqual([berry.BELUE])
    expect(teamStore.updateTeam).toHaveBeenCalled()
  })
})

describe('updateRecipeType', () => {
  it('updateRecipeType shall update the recipe type and call server', async () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()

    userStore.setTokens({ accessToken: 'at', expiryDate: 0, refreshToken: 'rt' })
    await nextTick()

    teamStore.updateTeam = vi.fn()

    await teamStore.updateRecipeType('dessert')
    expect(teamStore.getCurrentTeam.recipeType).toEqual('dessert')
    expect(teamStore.updateTeam).toHaveBeenCalled()
  })
})

describe('resetCurrentTeamSingleProduction', () => {
  it("shall reset every member's single production", () => {
    const teamStore = useTeamStore()
    teamStore.teams = createMockTeams(1, {
      production: createMockTeamProduction({
        members: [createMockMemberProduction(), createMockMemberProduction()]
      })
    })

    teamStore.resetCurrentTeamSingleProduction()

    expect(teamStore.getCurrentTeam.production?.members).toHaveLength(2)
    teamStore.getCurrentTeam.production?.members.forEach((member) => {
      expect(member.singleProduction).toBeUndefined()
    })
  })
})

describe('isSupportMember', () => {
  it('shall return false if member has no support skills or subskills', () => {
    const teamStore = useTeamStore()
    const mockPokemon = createMockPokemon()
    expect(teamStore.isSupportMember(mockPokemon)).toBe(false)
  })

  it('shall return true if member has helping bonus', () => {
    const teamStore = useTeamStore()
    const mockPokemon = createMockPokemon({
      subskills: [{ level: 10, subskill: subskill.HELPING_BONUS }]
    })
    expect(teamStore.isSupportMember(mockPokemon)).toBe(true)
  })

  it('shall return true if member has energy recovery bonus', () => {
    const teamStore = useTeamStore()
    const mockPokemon = createMockPokemon({
      subskills: [{ level: 10, subskill: subskill.ENERGY_RECOVERY_BONUS }]
    })
    expect(teamStore.isSupportMember(mockPokemon)).toBe(true)
  })

  it('shall return false if member has energy recovery bonus but not reached the level', () => {
    const teamStore = useTeamStore()
    const mockPokemon = createMockPokemon({
      level: 24,
      subskills: [{ level: 25, subskill: subskill.ENERGY_RECOVERY_BONUS }]
    })
    expect(teamStore.isSupportMember(mockPokemon)).toBe(false)
  })

  it('shall return true if member has energy for everyone', () => {
    const teamStore = useTeamStore()
    const mockPokemon = createMockPokemon({ pokemon: pokemon.WIGGLYTUFF })
    expect(teamStore.isSupportMember(mockPokemon)).toBe(true)
  })

  it('shall return true if member has energizing cheer', () => {
    const teamStore = useTeamStore()
    const mockPokemon = createMockPokemon({ pokemon: pokemon.LEAFEON })
    expect(teamStore.isSupportMember(mockPokemon)).toBe(true)
  })

  it('shall return true if member has energizing cheer and helping bonus', () => {
    const teamStore = useTeamStore()
    const mockPokemon = createMockPokemon({
      pokemon: pokemon.LEAFEON,
      subskills: [{ level: 10, subskill: subskill.HELPING_BONUS }]
    })
    expect(teamStore.isSupportMember(mockPokemon)).toBe(true)
  })
})
