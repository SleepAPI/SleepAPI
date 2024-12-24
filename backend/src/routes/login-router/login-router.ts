import type LoginController from '@src/controllers/login/login.controller';
import { Logger } from '@src/services/logger/logger';
import type { Request, Response } from 'express';
import { BaseRouter } from '../base-router';

class LoginRouterImpl {
  public async register(controller: LoginController) {
    BaseRouter.router.post(
      '/login/signup',
      async (req: Request<unknown, unknown, { authorization_code: string }>, res: Response) => {
        try {
          Logger.info('Entered /login/signup');
          const userData = await controller.signup(req.body);

          res.header('Content-Type', 'application/json').send(userData);
        } catch (err) {
          Logger.error((err as Error).stack);
          res.sendStatus(401);
        }
      }
    );

    BaseRouter.router.post(
      '/login/refresh',
      async (req: Request<unknown, unknown, { refresh_token: string }>, res: Response) => {
        try {
          Logger.info('Entered /login/refresh');

          const refreshedData = await controller.refresh(req.body);
          res.json(refreshedData);
        } catch (err) {
          Logger.error((err as Error).stack);
          res.sendStatus(401);
        }
      }
    );
  }
}

export const LoginRouter = new LoginRouterImpl();
