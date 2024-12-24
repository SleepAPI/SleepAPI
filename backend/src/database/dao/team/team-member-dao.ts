import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithVersionedIdSchema } from '@src/database/dao/abstract-dao';

const DBTeamMemberSchema = Type.Composite([
  DBWithVersionedIdSchema,
  Type.Object({
    fk_team_id: Type.Number(),
    fk_pokemon_id: Type.Number(),
    member_index: Type.Number()
  })
]);
export type DBTeamMember = Static<typeof DBTeamMemberSchema>;

class TeamMemberDAOImpl extends AbstractDAO<typeof DBTeamMemberSchema> {
  public tableName = 'team_member';
  public schema = DBTeamMemberSchema;
}

export const TeamMemberDAO = new TeamMemberDAOImpl();
