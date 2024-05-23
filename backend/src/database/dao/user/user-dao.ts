import { Static, Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithIdSchema } from '@src/database/dao/abstract-dao';

const DBUserSchema = Type.Composite([
  DBWithIdSchema,
  Type.Object({
    sub: Type.String(),
    external_id: Type.String({ minLength: 36, maxLength: 36 }),
    name: Type.String(),
    avatar: Type.Optional(Type.String()),
  }),
]);
export type DBUser = Static<typeof DBUserSchema>;

class UserDAOImpl extends AbstractDAO<typeof DBUserSchema> {
  public tableName = 'user';
  public schema = DBUserSchema;
}

export const UserDAO = new UserDAOImpl();
