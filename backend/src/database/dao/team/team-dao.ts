import { Static, Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithIdSchema } from '@src/database/dao/abstract-dao';

const DBTeamSchema = Type.Composite([
  DBWithIdSchema,
  Type.Object({
    fk_user_id: Type.Number(),
    team_index: Type.Number(),
    name: Type.String(),
    camp: Type.Boolean(),
  }),
]);
export type DBTeam = Static<typeof DBTeamSchema>;

class TeamDAOImpl extends AbstractDAO<typeof DBTeamSchema> {
  public tableName = 'team';
  public schema = DBTeamSchema;
}

export const TeamDAO = new TeamDAOImpl();
