import { Static, Type } from '@sinclair/typebox';
import { AbstractDAO, DBWithIdSchema } from './abstract-dao';

const DBMockSchema = Type.Composite([
  DBWithIdSchema,
  Type.Object({
    column1: Type.String(),
  }),
]);
export type DBMock = Static<typeof DBMockSchema>;

class MockDAOImpl extends AbstractDAO<typeof DBMockSchema> {
  public tableName = 'mock';
  public schema = DBMockSchema;

  public async seed(): Promise<void> {
    const result = await this.findMultiple();
    if (result.length > 0) {
      return;
    }

    const data = {
      column1: 'some-column',
    };

    await this.insert(data);
  }
}

export const MockDAO = new MockDAOImpl();
