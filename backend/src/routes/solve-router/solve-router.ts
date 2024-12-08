import { Logger } from '@src/services/logger/logger.js';
import { runWorkerFile } from '@src/services/worker/worker.js';
import { relativePath } from '@src/utils/file-utils/file-utils.js';
import { Request, Response } from 'express';
import workerpool from 'workerpool';

import { SolveIngredientRequest, SolveRecipeRequest } from 'sleepapi-common';
import { BaseRouter } from '../base-router.js';

const pool = workerpool.pool(relativePath('./solve-recipe-worker.js', import.meta.url), {
  maxWorkers: 1 // TODO: perhaps we can raise this now if cache size is smaller, have to check
});

class SolveRouterImpl {
  public async register() {
    BaseRouter.router.post(
      '/solve/recipe/:name',
      async (
        // TODO: remove pretty flag in sleepapi 2
        req: Request<{ name: string }, unknown, SolveRecipeRequest, { pretty?: boolean }>,
        res: Response
      ) => {
        try {
          Logger.log('Entered /solve/recipe/:name');

          const { name } = req.params;
          const { body } = req;
          const { pretty } = req.query;

          const data = await pool.exec('solveRecipe', [name, body, pretty]);

          res.json(data);
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.post(
      '/solve/ingredient/:name',
      // TODO: remove pretty flag in sleepapi 2.0
      async (req: Request<{ name: string }, unknown, SolveIngredientRequest, { pretty?: boolean }>, res: Response) => {
        try {
          Logger.log('Entered /solve/ingredient/:name');

          const data = await runWorkerFile(relativePath('./solve-ingredient-worker.js', import.meta.url), {
            name: req.params.name,
            body: req.body,
            pretty: req.query.pretty
          });
          res.json(data);
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const OptimalCombinationRouter = new SolveRouterImpl();
