import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao.js';

const schema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({ fk_team_id: Type.Number(), fk_pokemon_id: Type.Number(), sneaky_snacking: Type.Boolean() })
]);
class TeamScheduleMemberDAOImpl extends AbstractDAO<typeof schema> {
  public tableName = 'team_schedule_member';
  public schema = schema;
}
export const TeamScheduleMemberDAO = new TeamScheduleMemberDAOImpl();
