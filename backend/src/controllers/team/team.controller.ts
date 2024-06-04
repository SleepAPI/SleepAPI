import { DBTeamWithoutVersion } from '@src/database/dao/team/team-dao';
import { DBUser } from '@src/database/dao/user/user-dao';
import { getTeams, upsertTeamMember, upsertTeamMeta } from '@src/services/api-service/team/team-service';
import { UpsertTeamMemberRequest, UpsertTeamMetaRequest } from 'sleepapi-common';

export default class TeamController {
  public async upsertMeta(index: number, request: UpsertTeamMetaRequest, user: DBUser) {
    const team: DBTeamWithoutVersion = {
      fk_user_id: user.id,
      team_index: index,
      name: request.name,
      camp: request.camp,
    };
    return upsertTeamMeta(team);
  }

  public async upsertMember(params: { teamIndex: number; request: UpsertTeamMemberRequest; user: DBUser }) {
    return upsertTeamMember(params);
  }

  public async getTeams(user: DBUser) {
    return getTeams(user);
  }
}
