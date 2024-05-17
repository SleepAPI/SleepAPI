import { DatabaseMigrationError } from '@src/domain/error/database/database-error';
import dotenv from 'dotenv';

export class BackendConfig {
  constructor() {
    dotenv.config();
  }

  get config() {
    const {
      NODE_ENV,
      DATABASE_MIGRATION,
      PORT,
      DB_HOST,
      DB_PORT,
      DB_USER,
      DB_PASS,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GENERATE_TIERLIST,
    } = process.env;

    if (DATABASE_MIGRATION && DATABASE_MIGRATION !== 'UP' && DATABASE_MIGRATION !== 'DOWN') {
      throw new DatabaseMigrationError('DATABASE_MIGRATION is optional, but if set must be one of [UP, DOWN]');
    }

    return {
      NODE_ENV: NODE_ENV ?? 'DEV',
      PORT: PORT ?? 3000,
      DATABASE_MIGRATION,
      DB_HOST,
      DB_PORT,
      DB_USER,
      DB_PASS,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GENERATE_TIERLIST: GENERATE_TIERLIST === 'true' ? true : false,
    };
  }
}

export const config = new BackendConfig().config;
