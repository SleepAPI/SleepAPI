import { DatabaseService } from '@src/database/database-service.js';
import DatabaseMigration from '@src/database/migration/database-migration.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import fs from 'fs/promises';
import type { Knex } from 'knex';
import path from 'path';
import 'sleepapi-common';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });
let knex: Knex;

describe('Database migration', async () => {
  beforeEach(async () => {
    knex = await DatabaseService.getKnex();
  });

  it('shall migrate database up', async () => {
    const migrationFilesDB: string[] = (await knex.select('name').from('knex_migrations')).map((row) => row.name);
    const migrationsDir = path.resolve(__dirname, './migrations');
    const migrationFilesFS: string[] = await fs.readdir(migrationsDir);

    expect(migrationFilesDB).toEqual(migrationFilesFS);
    expect(migrationFilesDB).toHaveLength(17);
  });

  it('shall migrate database down', async () => {
    const knex = await DatabaseService.getKnex();
    await DatabaseMigration.downgrade();
    const migrationFilesDB: string[] = await knex.select('name').from('knex_migrations');

    expect(migrationFilesDB).toEqual([]);
  });
});
