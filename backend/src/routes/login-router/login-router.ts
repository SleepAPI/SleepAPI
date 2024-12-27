import type LoginController from '@src/controllers/login/login.controller.js';
import { BaseRouter } from '@src/routes/base-router.js';
import type { Request, Response } from 'express';

class LoginRouterImpl {
  public async register(controller: LoginController) {
    BaseRouter.router.post(
      '/login/signup',
      async (req: Request<unknown, unknown, { authorization_code: string }>, res: Response) => {
        try {
          logger.info('Entered /login/signup');
          const userData = await controller.signup(req.body);

          res.header('Content-Type', 'application/json').send(userData);
        } catch (err) {
          logger.error(err as Error);
          res.sendStatus(401);
        }
      }
    );

    BaseRouter.router.post(
      '/login/refresh',
      async (req: Request<unknown, unknown, { refresh_token: string }>, res: Response) => {
        try {
          logger.info('Entered /login/refresh');

          const refreshedData = await controller.refresh(req.body);
          res.json(refreshedData);
        } catch (err) {
          logger.error(err as Error);
          res.sendStatus(401);
        }
      }
    );
  }
}

export const LoginRouter = new LoginRouterImpl();
