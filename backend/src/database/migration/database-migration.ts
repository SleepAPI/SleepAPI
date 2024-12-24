import type { Knex } from 'knex';
import { resolve } from 'node:path';
import { Logger } from '../../services/logger/logger';
import { DatabaseService } from '../database-service';

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
    Logger.info('Rolling back all migrations');
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

      Logger.info(`Migrations ` + available.map((it) => it.file).join(', '));
      try {
        await knex.migrate.latest(configuration);
        return;
      } catch (error) {
        retryCount--;
        Logger.info(`Migration already running. Will retry ${retryCount}`);
        await new Promise((resolve) => setTimeout(resolve, 2_000));
      }
    }
  }
})();

export default DatabaseMigration;
