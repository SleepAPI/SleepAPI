import { BaseRouter } from '@src/routes/base-router.js';
import { runWorkerFile } from '@src/services/worker/worker.js';
import { queryAsBoolean } from '@src/utils/routing/routing-utils.js';
import type { Request, Response } from 'express';
import path from 'path';
import {
  type CalculateIvRequest,
  type CalculateIvResponse,
  type CalculateTeamRequest,
  type CalculateTeamResponse,
  type SingleProductionRequest
} from 'sleepapi-common';

class ProductionRouterImpl {
  public async register() {
    BaseRouter.router.post(
      '/calculator/production/:name',
      async (
        req: Request<
          { name: string },
          unknown,
          SingleProductionRequest,
          { pretty?: boolean; includeAnalysis?: boolean }
        >,
        res: Response
      ) => {
        try {
          logger.log('Entered /calculator/production/:name');
          const { name } = req.params;

          const pretty = queryAsBoolean(req.query.pretty);
          const includeAnalysis = queryAsBoolean(req.query.includeAnalysis);

          const result = await runWorkerFile(path.resolve(__dirname, './production-worker.js'), {
            name,
            body: req.body,
            pretty,
            includeAnalysis
          });
          res.header('Content-Type', 'application/json').send(JSON.stringify(result, null, 4));
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.post(
      '/calculator/team',
      async (req: Request<unknown, unknown, CalculateTeamRequest, unknown>, res: Response<CalculateTeamResponse>) => {
        try {
          logger.log('Entered /calculator/team');

          const data = await runWorkerFile(path.resolve(__dirname, './team-worker.js'), {
            body: req.body
          });
          res.json(data);
        } catch (err) {
          logger.error(err as Error);
          res.sendStatus(500);
        }
      }
    );

    BaseRouter.router.post(
      '/calculator/iv',
      async (req: Request<unknown, unknown, CalculateIvRequest, unknown>, res: Response<CalculateIvResponse>) => {
        try {
          logger.log('Entered /calculator/iv');

          const data = await runWorkerFile(path.resolve(__dirname, './iv-worker.js'), {
            body: req.body
          });
          res.json(data);
        } catch (err) {
          logger.error(err as Error);
          res.sendStatus(500);
        }
      }
    );
  }
}

export const ProductionRouter = new ProductionRouterImpl();
