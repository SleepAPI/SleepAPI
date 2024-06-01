import { DBTeamWithoutVersion, TeamDAO } from '@src/database/dao/team/team-dao';
import { DBUser } from '@src/database/dao/user/user-dao';
import { GetTeamsResponse } from 'sleepapi-common';

export async function upsertTeam(team: DBTeamWithoutVersion) {
  const existingTeam = await TeamDAO.find({ fk_user_id: team.fk_user_id, team_index: team.team_index });

  if (existingTeam) {
    return await TeamDAO.update({
      id: existingTeam.id,
      version: existingTeam.version,
      fk_user_id: existingTeam.fk_user_id,
      team_index: existingTeam.team_index,
      name: team.name,
      camp: team.camp,
    });
  } else {
    return await TeamDAO.insert(team);
  }
}

export async function getTeams(user: DBUser): Promise<GetTeamsResponse> {
  const teams = await TeamDAO.findMultiple({ fk_user_id: user.id });

  return {
    teams: teams.map((team) => ({
      index: team.team_index,
      name: team.name,
      camp: team.camp,
    })),
  };
}
