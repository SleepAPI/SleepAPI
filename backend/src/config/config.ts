import dotenv from 'dotenv';
import { DatabaseMigrationError } from '../domain/error/database/database-error';

export class BackendConfig {
  constructor() {
    dotenv.config();
  }

  get config() {
    const { NODE_ENV, DATABASE_MIGRATION, PORT, SECRET, DB_HOST, DB_PORT, DB_USER, DB_PASS } = process.env;

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
      SECRET,
    };
  }
}

export const config = new BackendConfig().config;
