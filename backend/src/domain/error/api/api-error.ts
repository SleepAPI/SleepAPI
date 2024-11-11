import { SleepAPIError } from '@src/domain/error/sleepapi-error';

export class AuthorizationError extends SleepAPIError {}

export class BadRequestError extends SleepAPIError {}
