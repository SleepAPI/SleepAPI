import { vi } from 'vitest';

import { validateAuthHeader } from '@src/middleware/authorization-middleware.js';
import { Logger } from '@src/services/logger/logger.js';

import { DBUser } from '@src/database/dao/user/user-dao.js';
import { AuthenticatedRequest } from '@src/middleware/authorization-middleware.js';
import * as loginService from '@src/services/api-service/login/login-service.js';
import { NextFunction, Request, Response } from 'express';

// vi.mock('./login-service.js', () => ({
//   verify: vi.fn(),
// }));
vi.mock('@src/services/logger/logger.ts');

describe('validateAuthHeader middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      sendStatus: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn() as unknown as NextFunction;
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
    expect(Logger.error).toHaveBeenCalledWith('Unauthorized: AuthorizationError: Invalid access token');
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
    const spy = vi.spyOn(loginService, 'verify');
    spy.mockResolvedValue(mockUser);

    await validateAuthHeader(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect((req as AuthenticatedRequest).user).toEqual(mockUser);
  });

  it('should respond with 401 if token verification fails', async () => {
    req.headers!.authorization = 'Bearer invalidtoken';

    const spy = vi.spyOn(loginService, 'verify');
    spy.mockRejectedValue(new Error('Invalid token'));

    await validateAuthHeader(req as Request, res as Response, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(Logger.error).toHaveBeenCalledWith('Unauthorized: Error: Invalid token');
  });
});
