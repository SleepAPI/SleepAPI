import { DatabaseService } from '@src/database/database-service.js';
import type { Knex } from 'knex';
import { resolve } from 'node:path';

const DatabaseMigration = new (class {
  public async migrate() {
    const baseDir = resolve(__dirname, './', 'migrations');
    const configuration: Knex.MigratorConfig = {};

    await this.#performMigration({ ...configuration, directory: baseDir });
  }

  public async downgrade() {
    const baseDir = resolve(__dirname, './', 'migrations');
    const configuration: Knex.MigratorConfig = {};

    const knex = await DatabaseService.getKnex();
    logger.info('Rolling back all migrations');
    await knex.migrate.rollback({ ...configuration, directory: baseDir });
  }

  async #performMigration(configuration: Knex.MigratorConfig) {
    const knex = await DatabaseService.getKnex();

    let retryCount = 5;
    while (retryCount > 0) {
      const migrations = await knex.migrate.list(configuration);

      type MigrationData = {
        file: string;
      };
      const [, available]: [Array<MigrationData>, Array<MigrationData>] = migrations;

      if (available.length === 0) {
        return;
      }

      logger.info(`Migrations ` + available.map((it) => it.file).join(', '));
      try {
        await knex.migrate.latest(configuration);
        return;
      } catch (error) {
        retryCount--;
        logger.error(`Migration failed, will retry ${retryCount}, error: ${error}`);
        await new Promise((resolve) => setTimeout(resolve, 2_000));
      }
    }
  }
})();

export default DatabaseMigration;
