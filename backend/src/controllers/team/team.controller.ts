import type { DBTeamWithoutVersion } from '@src/database/dao/team/team-dao.js';
import type { DBUser } from '@src/database/dao/user/user-dao.js';
import {
  deleteMember,
  deleteTeam,
  getTeams,
  upsertTeamMember,
  upsertTeamMeta
} from '@src/services/api-service/team/team-service.js';
import type { UpsertTeamMemberRequest, UpsertTeamMetaRequest } from 'sleepapi-common';

export default class TeamController {
  public async upsertMeta(index: number, request: UpsertTeamMetaRequest, user: DBUser) {
    const team: DBTeamWithoutVersion = {
      fk_user_id: user.id,
      team_index: index,
      name: request.name,
      camp: request.camp,
      bedtime: request.bedtime,
      wakeup: request.wakeup,
      recipe_type: request.recipeType,
      favored_berries: request.favoredBerries?.join(',')
    };
    return upsertTeamMeta(team);
  }

  public async deleteTeam(index: number, user: DBUser) {
    return deleteTeam(index, user);
  }

  public async upsertMember(params: {
    teamIndex: number;
    memberIndex: number;
    request: UpsertTeamMemberRequest;
    user: DBUser;
  }) {
    return upsertTeamMember(params);
  }

  public async getTeams(user: DBUser) {
    return getTeams(user);
  }

  public async deleteMember(params: { teamIndex: number; memberIndex: number; user: DBUser }) {
    return deleteMember(params);
  }
}
