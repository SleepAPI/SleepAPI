import { TeamService } from '@/services/team/team-service'
import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { createPinia, setActivePinia } from 'pinia'
import { uuid, type PokemonInstanceExt } from 'sleepapi-common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/team/team-service', () => ({
  TeamService: {
    getTeams: vi.fn(),
    createOrUpdateTeam: vi.fn(),
    createOrUpdateMember: vi.fn()
  }
}))

describe('Team Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have expected default state', () => {
    const teamStore = useTeamStore()
    expect(teamStore.$state).toMatchInlineSnapshot(`
      {
        "currentIndex": 0,
        "loadingTeams": true,
        "maxAvailableTeams": 5,
        "teams": [
          {
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
    TeamService.getTeams = vi.fn().mockResolvedValue([
      { index: 0, name: 'Team 1', camp: true },
      { index: 1, name: 'Team 2', camp: false }
    ])

    await teamStore.populateTeams()

    expect(TeamService.getTeams).toHaveBeenCalled()
    expect(teamStore.$state.teams).toMatchInlineSnapshot(`
      [
        {
          "camp": true,
          "index": 0,
          "name": "Team 1",
        },
        {
          "camp": false,
          "index": 1,
          "name": "Team 2",
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

  it('should update current team name correctly', async () => {
    const teamStore = useTeamStore()
    const userStore = useUserStore()
    userStore.setTokens({
      accessToken: 'token1',
      expiryDate: 10,
      refreshToken: 'token2'
    })
    teamStore.teams = [
      {
        index: 0,
        name: 'Old Team Name',
        camp: false,
        members: [],
        version: 1,
        production: undefined
      }
    ]

    await teamStore.updateTeamName('New Team Name')

    expect(teamStore.teams[0].name).toBe('New Team Name')
    expect(teamStore.getCurrentTeam.name).toBe('New Team Name')
    expect(TeamService.createOrUpdateTeam).toHaveBeenCalledWith(0, {
      name: 'New Team Name',
      camp: false
    })
  })

  it('should reset the state correctly', () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      { index: 0, name: 'Team 1', camp: false, members: [], version: 1, production: undefined },
      { index: 1, name: 'Team 2', camp: false, members: [], version: 1, production: undefined }
    ]
    teamStore.currentIndex = 1
    teamStore.maxAvailableTeams = 4
    teamStore.loadingTeams = false

    teamStore.reset()

    expect(teamStore.$state).toMatchInlineSnapshot(`
      {
        "currentIndex": 0,
        "loadingTeams": true,
        "maxAvailableTeams": 5,
        "teams": [
          {
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
          },
        ],
      }
    `)
  })

  it('should increment currentIndex correctly on next()', () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      { index: 0, name: 'Team 1', camp: false, members: [], version: 1, production: undefined },
      { index: 1, name: 'Team 2', camp: false, members: [], version: 1, production: undefined }
    ]

    teamStore.next()
    expect(teamStore.currentIndex).toBe(1)

    teamStore.next()
    expect(teamStore.currentIndex).toBe(0)
  })

  it('should decrement currentIndex correctly on prev()', () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      { index: 0, name: 'Team 1', camp: false, members: [], version: 1, production: undefined },
      { index: 1, name: 'Team 2', camp: false, members: [], version: 1, production: undefined }
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
    const member = uuid.v4()
    teamStore.teams = [
      {
        index: 0,
        name: 'Team 1',
        camp: false,
        members: [undefined, member, undefined, undefined, undefined],
        version: 1,
        production: undefined
      }
    ]
    pokemonStore.upsertPokemon({ name: 'Pikachu', externalId: member } as any)

    TeamService.createOrUpdateMember = vi.fn().mockResolvedValue({ index: 0, name: 'Pikachu' })

    await teamStore.duplicateMember(1)

    expect(teamStore.teams[0].members[0]).toEqual(member)
    expect(TeamService.createOrUpdateMember).toHaveBeenCalledWith({
      teamIndex: 0,
      memberIndex: 0,
      member: {
        externalId: member,
        name: 'Pikachu'
      }
    })
  })

  it('should not duplicate if no open slot is available', async () => {
    const teamStore = useTeamStore()
    const member = uuid.v4()

    teamStore.teams = [
      {
        index: 0,
        name: 'Team 1',
        camp: false,
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
        members: [undefined, member, null as any, member, '' as any],
        version: 1,
        production: undefined
      }
    ]

    const size = teamStore.getTeamSize
    expect(size).toBe(2)
  })
})
