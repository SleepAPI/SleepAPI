import knex, { Knex } from 'knex';
import { DatabaseService } from '../../database/database-service';
import DatabaseMigration from '../../database/migration/database-migration';
import { MockService } from './mock-service';

type InitParams = {
  enforceForeignKeyConstraints?: boolean;
  recreateDatabasesBeforeEachTest?: boolean;
};

async function truncateAllTables(params?: InitParams, knex?: Knex): Promise<void> {
  if (!knex) {
    return;
  }

  const SQLITE_SEQUENCE_TABLE = 'sqlite_sequence';
  const EXCLUDE_PREFIX = ['knex', 'sqlite'];

  const tables = await knex('sqlite_master').where('type', 'table');
  const tableNames = tables
    ?.map((row) => row.name)
    .filter((tableName) => !EXCLUDE_PREFIX.some((prefix) => tableName.startsWith(prefix)));

  await knex.raw('PRAGMA foreign_keys = OFF');

  await Promise.all(tableNames?.map((tableName) => knex(tableName).truncate()) ?? []);
  if (await knex.schema.hasTable(SQLITE_SEQUENCE_TABLE)) {
    await knex(SQLITE_SEQUENCE_TABLE).truncate();
  }

  if (params?.enforceForeignKeyConstraints) {
    await knex?.raw('PRAGMA foreign_keys = ON');
  }
}

export const DaoFixture = {
  init(params?: InitParams) {
    let pokemonsleepDB: Knex;

    if (params?.recreateDatabasesBeforeEachTest) {
      beforeEach(async () => {
        await setup();
      });
    } else {
      beforeAll(async () => {
        await setup();
      });
    }

    async function setup() {
      MockService.init({ DatabaseService });

      pokemonsleepDB = knex({
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: ':memory:',
        acquireConnectionTimeout: 10000,
      });

      Object.defineProperty(DatabaseService, '#knex', {
        configurable: true,
        value: pokemonsleepDB,
      });

      if (params?.enforceForeignKeyConstraints) {
        await pokemonsleepDB?.raw('PRAGMA foreign_keys = ON');
      }

      DatabaseService.getKnex = () => Promise.resolve(pokemonsleepDB);
      await DatabaseMigration.migrate();
    }

    async function destroyDatabases() {
      await pokemonsleepDB.destroy();
    }

    afterEach(async () => {
      if (params?.recreateDatabasesBeforeEachTest) {
        await destroyDatabases();
      } else {
        await truncateAllTables(params, pokemonsleepDB);
      }

      MockService.restore();
    });

    afterAll(async () => {
      if (!params?.recreateDatabasesBeforeEachTest) {
        await destroyDatabases();
      }
    });
  },
};
