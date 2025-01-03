import { DatabaseService } from '@src/database/database-service.js';
import { relativePath } from '@src/utils/file-utils/file-utils.js';
import type { Knex } from 'knex';

const DatabaseMigration = new (class {
  public async migrate() {
    const baseDir = relativePath('migrations', import.meta.url);
    const configuration: Knex.MigratorConfig = { directory: baseDir };
    await this.#performMigration(configuration);
  }

  public async downgrade() {
    const baseDir = relativePath('migrations', import.meta.url);
    const configuration: Knex.MigratorConfig = { directory: baseDir };

    const knex = await DatabaseService.getKnex();
    logger.info('Rolling back all migrations');
    await knex.migrate.rollback(configuration);
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
