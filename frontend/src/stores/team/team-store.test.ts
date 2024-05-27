import { TeamService } from '@/services/team/team-service'
import { useTeamStore } from '@/stores/team/team-store'
import { useUserStore } from '@/stores/user-store'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/team/team-service', () => ({
  TeamService: {
    getTeams: vi.fn(),
    createOrUpdateTeam: vi.fn()
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
            "name": "Log in to save your teams",
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
        {
          "camp": false,
          "index": 2,
          "name": "Helper team 3",
        },
        {
          "camp": false,
          "index": 3,
          "name": "Helper team 4",
        },
        {
          "camp": false,
          "index": 4,
          "name": "Helper team 5",
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
    teamStore.teams = [{ index: 0, name: 'Old Team Name', camp: false }]

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
      { index: 0, name: 'Team 1', camp: false },
      { index: 1, name: 'Team 2', camp: false }
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
            "name": "Log in to save your teams",
          },
        ],
      }
    `)
  })

  it('should increment currentIndex correctly on next()', () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      { index: 0, name: 'Team 1', camp: false },
      { index: 1, name: 'Team 2', camp: false }
    ]

    teamStore.next()
    expect(teamStore.currentIndex).toBe(1)

    teamStore.next()
    expect(teamStore.currentIndex).toBe(0)
  })

  it('should decrement currentIndex correctly on prev()', () => {
    const teamStore = useTeamStore()
    teamStore.teams = [
      { index: 0, name: 'Team 1', camp: false },
      { index: 1, name: 'Team 2', camp: false }
    ]

    teamStore.prev()
    expect(teamStore.currentIndex).toBe(1)

    teamStore.prev()
    expect(teamStore.currentIndex).toBe(0)
  })
})
