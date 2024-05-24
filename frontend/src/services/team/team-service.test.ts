import serverAxios from '@/router/server-axios'
import { TeamService } from '@/services/team/team-service'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/router/server-axios', () => ({
  default: {
    put: vi.fn(() => ({ data: 'successful response' })),
    get: vi.fn(() => ({ data: { teams: 'successful response' } }))
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
  it('should call server to get teams', async () => {
    const res = await TeamService.getTeams()

    expect(serverAxios.get).toHaveBeenCalledWith('team')
    expect(res).toMatchInlineSnapshot(`"successful response"`)
  })
})
