import type { DBUser } from '@src/database/dao/user/user-dao.js';
import type { AuthenticatedRequest } from '@src/middleware/authorization-middleware.js';
import { validateAuthHeader } from '@src/middleware/authorization-middleware.js';
import * as loginService from '@src/services/api-service/login/login-service.js';
import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import type { NextFunction, Request, Response } from 'express';
import type { Logger } from 'sleepapi-common';

describe('validateAuthHeader middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      sendStatus: mock().mockReturnThis(),
      json: mock()
    };
    next = mock() as unknown as NextFunction;

    global.logger = {
      debug: mock() as unknown,
      log: mock() as unknown,
      info: mock() as unknown,
      warn: mock() as unknown,
      error: mock() as unknown
    } as Logger;
  });

  afterEach(() => {
    mock().mockRestore();
  });

  it('should respond with 401 if no Authorization header is present', async () => {
    await validateAuthHeader(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should respond with 401 if Authorization header does not start with Bearer', async () => {
    req.headers!.authorization = 'Basic token';
    await validateAuthHeader(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);

    expect(logger.error).toHaveBeenCalledWith('Unauthorized: AuthorizationError: Invalid access token');
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if Authorization header is valid and token is verified', async () => {
    req.headers!.authorization = 'Bearer validtoken';
    const mockUser: DBUser = {
      id: 1,
      version: 1,
      sub: 'test-sub',
      external_id: '00000000-0000-0000-0000-000000000000',
      name: 'Test User',
      avatar: 'test-avatar'
    };
    const spy = spyOn(loginService, 'verify');
    spy.mockResolvedValue(mockUser);

    await validateAuthHeader(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect((req as AuthenticatedRequest).user).toEqual(mockUser);
    spy.mockRestore();
  });

  it('should respond with 401 if token verification fails', async () => {
    req.headers!.authorization = 'Bearer invalidtoken';

    const spy = spyOn(loginService, 'verify');
    spy.mockRejectedValue(new Error('Invalid token'));

    await validateAuthHeader(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Unauthorized: Error: Invalid token');
    spy.mockRestore();
  });
});
