import { Logger } from '@src/services/logger/logger.js';
import { runWorkerFile } from '@src/services/worker/worker.js';
import { relativePath } from '@src/utils/file-utils/file-utils.js';
import { queryAsBoolean } from '@src/utils/routing/routing-utils.js';
import { Request, Response } from 'express';
import {
  CalculateIvRequest,
  CalculateIvResponse,
  CalculateTeamRequest,
  CalculateTeamResponse,
  SingleProductionRequest
} from 'sleepapi-common';

import workerpool from 'workerpool';
import { BaseRouter } from '../base-router.js';

const teamPool = workerpool.pool(relativePath('./team-worker.js', import.meta.url), {
  minWorkers: 4,
  maxWorkers: 4
});
const ivPool = workerpool.pool(relativePath('./iv-worker.js', import.meta.url), {
  minWorkers: 4,
  maxWorkers: 4
});

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
          Logger.log('Entered /calculator/production/:name');
          const { name } = req.params;

          const pretty = queryAsBoolean(req.query.pretty);
          const includeAnalysis = queryAsBoolean(req.query.includeAnalysis);

          const result = await runWorkerFile(relativePath('./production-worker.js', import.meta.url), {
            name,
            body: req.body,
            pretty,
            includeAnalysis
          });
          res.header('Content-Type', 'application/json').send(JSON.stringify(result, null, 4));
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.post(
      '/calculator/team',
      async (req: Request<unknown, unknown, CalculateTeamRequest, unknown>, res: Response<CalculateTeamResponse>) => {
        try {
          Logger.log('Entered /calculator/team');

          const data = await teamPool.exec('calculateTeam', [req.body]);
          res.json(data);
        } catch (err) {
          Logger.error((err as Error).stack);
          res.sendStatus(500);
        }
      }
    );

    BaseRouter.router.post(
      '/calculator/iv',
      async (req: Request<unknown, unknown, CalculateIvRequest, unknown>, res: Response<CalculateIvResponse>) => {
        try {
          Logger.log('Entered /calculator/iv');

          const data = await ivPool.exec('calculateIv', [req.body]);
          res.json(data);
        } catch (err) {
          Logger.error((err as Error).stack);
          res.sendStatus(500);
        }
      }
    );
  }
}

export const ProductionRouter = new ProductionRouterImpl();
