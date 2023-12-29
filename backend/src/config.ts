import dotenv from 'dotenv';

dotenv.config();

const { DATABASE_MIGRATION, PORT, PROD_DB_HOST, PROD_DB_PORT, PROD_DB_USER, PROD_DB_PASS, SECRET } = process.env;

let { ENVIRONMENT, DB_HOST, DB_PORT, DB_USER, DB_PASS } = process.env;

if (!ENVIRONMENT) {
  ENVIRONMENT = 'DEV';
}

if (ENVIRONMENT === 'PROD') {
  DB_HOST = PROD_DB_HOST;
  DB_PORT = PROD_DB_PORT;
  DB_USER = PROD_DB_USER;
  DB_PASS = PROD_DB_PASS;
}

if (
  DATABASE_MIGRATION &&
  DATABASE_MIGRATION !== 'UP' &&
  DATABASE_MIGRATION !== 'DOWN' &&
  DATABASE_MIGRATION !== 'FLEX'
) {
  throw new Error('DATABASE_MIGRATION is optional, but if set must be one of [UP, DOWN, FLEX]');
}

export const config = {
  ENVIRONMENT,
  DATABASE_MIGRATION,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASS,
  PROD_DB_HOST,
  PROD_DB_PORT,
  PROD_DB_USER,
  PROD_DB_PASS,
  SECRET,
};
