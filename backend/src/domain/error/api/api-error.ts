import { SleepAPIError } from '@src/domain/error/sleepapi-error.js';

export class AuthorizationError extends SleepAPIError {}

export class BadRequestError extends SleepAPIError {}
