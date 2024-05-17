import { Static, Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithIdSchema } from '@src/database/dao/abstract-dao';

const DBTokenSchema = Type.Composite([
  DBWithIdSchema,
  Type.Object({
    device_id: Type.String({ minLength: 36, maxLength: 36 }),
    refresh_token: Type.String({ maxLength: 255 }),
    last_login: Type.Optional(Type.String({ format: 'date-time' })),
  }),
]);
export type DBToken = Static<typeof DBTokenSchema>;

class TokenDAOImpl extends AbstractDAO<typeof DBTokenSchema> {
  public tableName = 'token';
  public schema = DBTokenSchema;
}

export const TokenDAO = new TokenDAOImpl();
