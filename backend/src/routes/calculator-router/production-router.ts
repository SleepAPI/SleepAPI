import ProductionController from '@src/controllers/calculator/production.controller';
import { Logger } from '@src/services/logger/logger';
import { runWorkerFile } from '@src/services/worker/worker';
import { queryAsBoolean } from '@src/utils/routing/routing-utils';
import { Request, Response } from 'express';
import path from 'path';
import { CalculateTeamRequest, CalculateTeamResponse } from 'sleepapi-common';
import { BaseRouter } from '../base-router';

export interface ProductionRequest {
  level: number;
  nature: string;
  subskills: string[];
  e4eProcs: number;
  e4eLevel: number;
  cheer: number;
  extraHelpful: number;
  helperBoostProcs: number;
  helperBoostUnique: number;
  helperBoostLevel: number;
  helpingbonus: number;
  camp: boolean;
  erb: number;
  recoveryIncense: boolean;
  skillLevel: number;
  mainBedtime: string;
  mainWakeup: string;
  ingredientSet: string[];
  nrOfEvolutions?: number;
}

class ProductionRouterImpl {
  public async register(controller: ProductionController) {
    BaseRouter.router.post(
      '/calculator/production/:name',
      async (req: Request<{ name: string }, unknown, ProductionRequest, { pretty?: boolean }>, res: Response) => {
        try {
          Logger.log('Entered /calculator/production/:name');
          const { name } = req.params;

          const pretty = queryAsBoolean(req.query.pretty);

          const result = await runWorkerFile(path.resolve(__dirname, './production-worker.js'), {
            name,
            body: req.body,
            pretty,
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

          const data = await runWorkerFile(path.resolve(__dirname, './team-worker.js'), {
            body: req.body,
          });
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
