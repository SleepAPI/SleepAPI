import { SleepAPIError } from '../sleepapi-error.js';

export class DatabaseMigrationError extends SleepAPIError {}

export class DatabaseConnectionError extends SleepAPIError {}

export class DatabaseNotFoundError extends SleepAPIError {}

export class DatabaseInsertError extends SleepAPIError {}
