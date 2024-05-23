import serverAxios from '@/router/server-axios'
import type { GetTeamsResponse, PutTeamRequest, PutTeamResponse } from 'sleepapi-common'

class TeamServiceImpl {
  public async upsert(index: number, teamInfo: PutTeamRequest) {
    const response = await serverAxios.put<PutTeamResponse>(`team/${index}`, teamInfo)

    return response.data
  }

  public async getTeams() {
    const response = await serverAxios.get<GetTeamsResponse>('team')
    return response.data.teams
  }
}

export const TeamService = new TeamServiceImpl()
