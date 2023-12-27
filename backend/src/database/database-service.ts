import knex, { Knex } from 'knex';
import { config } from '../config';

class DatabaseServiceImpl {
  #knex: Knex | undefined;
  #prodKnex: Knex | undefined;

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

  async getProdKnex() {
    if (!this.#prodKnex) {
      const host = config.PROD_DB_HOST;
      const port = config.PROD_DB_PORT;
      const user = config.PROD_DB_USER;
      const password = config.PROD_DB_PASS;

      if (!host || !port || !user || !password) {
        throw new Error('Missing environment variables for prod database connection');
      }

      this.#prodKnex = knex({
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

    return this.#prodKnex;
  }
}

export const DatabaseService = new DatabaseServiceImpl();
