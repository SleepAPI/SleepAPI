import knex, { Knex } from 'knex';
import { config } from '../config/config';

class DatabaseServiceImpl {
  #knex: Knex | undefined;

  async getKnex() {
    if (!this.#knex) {
      const host = config.DB_HOST;
      const port = config.DB_PORT;
      const user = config.DB_USER;
      const password = config.DB_PASS;

      if (!host || !port || !user || !password) {
        throw new Error('Missing environment variables for database connection');
      }

      this.#knex = knex({
        client: 'mysql2',
        connection: {
          host,
          port: +port,
          user,
          password,
          database: 'pokemonsleep',
        },
      });
    }

    return this.#knex;
  }
}

export const DatabaseService = new DatabaseServiceImpl();
