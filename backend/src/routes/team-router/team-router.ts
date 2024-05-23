import TeamController from '@src/controllers/team/team.controller';
import { AuthenticatedRequest, validateAuthHeader } from '@src/middleware/authorization-middleware';
import { Logger } from '@src/services/logger/logger';
import { Request, Response } from 'express';
import { PutTeamRequest, PutTeamResponse } from 'sleepapi-common';
import { BaseRouter } from '../base-router';

class TeamRouterImpl {
  public async register(controller: TeamController) {
    BaseRouter.router.get('/team', validateAuthHeader, async (req: Request, res: Response) => {
      try {
        Logger.log('Entered /team');

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
          throw new Error('User not found');
        }

        const teams = await controller.getTeams(user);
        res.json(teams);
      } catch (err) {
        Logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });

    BaseRouter.router.put(
      '/team/:index',
      validateAuthHeader,
      async (req: Request<{ index: string }, PutTeamResponse, PutTeamRequest, unknown>, res: Response) => {
        try {
          Logger.log('Entered /team/:index');

          const { index } = req.params;

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.upsert(+index, req.body, user);

          res.status(200);
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const TeamRouter = new TeamRouterImpl();
