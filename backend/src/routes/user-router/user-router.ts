import UserController from '@src/controllers/user/user.controller';
import { AuthenticatedRequest, validateAuthHeader } from '@src/middleware/authorization-middleware';
import { Logger } from '@src/services/logger/logger';
import { Request, Response } from 'express';
import { BaseRouter } from '../base-router';

class UserRouterImpl {
  public async register(controller: UserController) {
    BaseRouter.router.delete('/user', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        Logger.log('Entered /user DEL');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        await controller.deleteUser(user);

        res.sendStatus(204);
      } catch (err) {
        Logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const UserRouter = new UserRouterImpl();
