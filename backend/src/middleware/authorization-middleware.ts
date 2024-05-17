import { AuthorizationError } from '@src/domain/error/api/api-error';
import { verify } from '@src/services/api-service/login/login-service';
import { Logger } from '@src/services/logger/logger';
import { NextFunction, Request, Response } from 'express';

export async function validateAuthHeader(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthorizationError('Invalid access token');
    }

    const accessToken = authHeader.split(' ')[1];
    await verify(accessToken);

    next();
  } catch (error) {
    Logger.error('Unauthorized: ' + error);
    res.status(401);
  }
}
