import UserController from '@src/controllers/user/user.controller';
import { AuthenticatedRequest, validateAuthHeader } from '@src/middleware/authorization-middleware';
import { Logger } from '@src/services/logger/logger';
import { Request, Response } from 'express';
import { PokemonInstanceWithMeta } from 'sleepapi-common';
import { BaseRouter } from '../base-router';

class UserRouterImpl {
  public async register(controller: UserController) {
    BaseRouter.router.get('/user/pokemon', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        Logger.log('Entered /user/pokemon GET');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        const data = await controller.getUserPokemon(user);

        res.json(data);
      } catch (err) {
        Logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });

    BaseRouter.router.put(
      '/user/pokemon',
      validateAuthHeader,
      async (req: Request<unknown, unknown, PokemonInstanceWithMeta, unknown>, res: Response) => {
        try {
          Logger.log('Entered /user/pokemon PUT');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.upsertPokemon({ user, pokemonInstance: req.body });

          res.sendStatus(204);
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.delete(
      '/user/pokemon/:externalId',
      validateAuthHeader,
      async (req: Request<{ externalId: string }, unknown, unknown, unknown>, res: Response) => {
        try {
          Logger.log('Entered /user/pokemon/:externalId DELETE');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.deletePokemon({ user, externalId: req.params.externalId });

          res.sendStatus(204);
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

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
