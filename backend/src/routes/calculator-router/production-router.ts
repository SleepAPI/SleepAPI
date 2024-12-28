import { BaseRouter } from '@src/routes/base-router.js';
import { calculatorPool } from '@src/services/worker/worker-pool.js';
import type { Request, Response } from 'express';
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
          const body = req.body;
          const { pretty, includeAnalysis = false } = req.query;

          const result = await calculatorPool.exec('calculateProduction', [name, body, includeAnalysis, pretty]);
          res.json(result);
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

          const data = await calculatorPool.exec('calculateTeam', [req.body]);

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

          const data = await calculatorPool.exec('calculateIv', [req.body]);

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
