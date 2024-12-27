import type { DBUser } from '@src/database/dao/user/user-dao.js';
import { AuthorizationError } from '@src/domain/error/api/api-error.js';
import { verify } from '@src/services/api-service/login/login-service.js';
import type { NextFunction, Request, Response } from 'express';

export interface AuthenticatedRequest extends Request<unknown, unknown, unknown, unknown> {
  user: DBUser;
}

export async function validateAuthHeader(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthorizationError('Invalid access token');
    }

    const accessToken = authHeader.split(' ')[1];
    const user = await verify(accessToken);

    (req as AuthenticatedRequest).user = user;

    next();
  } catch (error) {
    logger.error('Unauthorized: ' + error);
    res.sendStatus(401);
  }
}
