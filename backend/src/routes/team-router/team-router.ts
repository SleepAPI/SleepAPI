import TeamController from '@src/controllers/team/team.controller';
import { AuthenticatedRequest, validateAuthHeader } from '@src/middleware/authorization-middleware';
import { Logger } from '@src/services/logger/logger';
import { Request, Response } from 'express';
import {
  UpsertTeamMemberRequest,
  UpsertTeamMemberResponse,
  UpsertTeamMetaRequest,
  UpsertTeamMetaResponse,
} from 'sleepapi-common';
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

    BaseRouter.router.delete(
      '/team/:index',
      validateAuthHeader,
      async (req: Request<{ index: string }, unknown, unknown, unknown>, res: Response) => {
        try {
          Logger.log('Entered /team/:index DEL');

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          const teams = await controller.deleteTeam(+req.params.index, user);
          res.json(teams);
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.put(
      '/team/meta/:index',
      validateAuthHeader,
      async (
        req: Request<{ index: string }, UpsertTeamMetaResponse, UpsertTeamMetaRequest, unknown>,
        res: Response
      ) => {
        try {
          Logger.log('Entered /team/meta/:index');

          const { index } = req.params;

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          const data = await controller.upsertMeta(+index, req.body, user);
          res.json(data);
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.put(
      '/team/:teamIndex/member/:memberIndex',
      validateAuthHeader,
      async (
        req: Request<
          { teamIndex: string; memberIndex: string },
          UpsertTeamMemberResponse,
          UpsertTeamMemberRequest,
          unknown
        >,
        res: Response
      ) => {
        try {
          Logger.log('Entered PUT /team/:teamIndex/member/:memberIndex');

          const { teamIndex, memberIndex } = req.params;

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          const updatedMember = await controller.upsertMember({
            teamIndex: +teamIndex,
            memberIndex: +memberIndex,
            request: req.body,
            user,
          });

          res.json(updatedMember);
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.delete(
      '/team/:teamIndex/member/:memberIndex',
      validateAuthHeader,
      async (req: Request<{ teamIndex: string; memberIndex: string }, unknown, unknown, unknown>, res: Response) => {
        try {
          Logger.log('Entered DEL /team/:teamIndex/member/:memberIndex');

          const { teamIndex, memberIndex } = req.params;

          const user = (req as AuthenticatedRequest).user;
          if (!user) {
            throw new Error('User not found');
          }

          await controller.deleteMember({ teamIndex: +teamIndex, memberIndex: +memberIndex, user });

          res.sendStatus(204);
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const TeamRouter = new TeamRouterImpl();
