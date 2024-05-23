import { DBTeam } from '@src/database/dao/team/team-dao';
import { DBUser } from '@src/database/dao/user/user-dao';
import { getTeams, upsertTeam } from '@src/services/api-service/team/team-service';
import { PutTeamRequest } from 'sleepapi-common';

export default class TeamController {
  public async upsert(index: number, request: PutTeamRequest, user: DBUser) {
    const team: Omit<DBTeam, 'id'> = {
      fk_user_id: user.id,
      team_index: index,
      name: request.name,
      camp: request.camp,
    };
    return upsertTeam(team);
  }

  public async getTeams(user: DBUser) {
    return getTeams(user);
  }
}
