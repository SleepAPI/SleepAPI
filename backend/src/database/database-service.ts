import type { Knex } from 'knex';
import knex from 'knex';
import { config } from '../config/config';
import { DatabaseConnectionError } from '../domain/error/database/database-error';

class DatabaseServiceImpl {
  #knex: Knex | undefined;

  async getKnex() {
    if (!this.#knex) {
      const host = config.DB_HOST;
      const port = config.DB_PORT;
      const user = config.DB_USER;
      const password = config.DB_PASS;

      if (!host || !port || !user || !password) {
        throw new DatabaseConnectionError('Missing environment variables for database connection');
      }

      this.#knex = knex({
        client: 'mysql2',
        connection: {
          host,
          port: +port,
          user,
          password,
          database: 'pokemonsleep'
        },
        migrations: {
          extension: 'ts',
          directory: './migration/migrations'
        }
      });
    }

    return this.#knex;
  }
}

export const DatabaseService = new DatabaseServiceImpl();
