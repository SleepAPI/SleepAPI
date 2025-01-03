import type { Request, Response } from 'express';

import { BaseRouter } from '@src/routes/base-router.js';
import { solvePool } from '@src/services/worker/worker-pool.js';
import { type SolveIngredientRequest, type SolveRecipeRequest } from 'sleepapi-common';

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
          logger.log('Entered /solve/recipe/:name');

          const name = req.params.name;
          const body = req.body;
          const pretty = req.query.pretty;

          const data = await solvePool.exec('solveRecipe', [name, body, pretty]);
          res.json(data);
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.post(
      '/solve/ingredient/:name',
      // TODO: remove pretty flag in sleepapi 2.0
      async (req: Request<{ name: string }, unknown, SolveIngredientRequest, { pretty?: boolean }>, res: Response) => {
        try {
          logger.log('Entered /solve/ingredient/:name');
          const name = req.params.name;
          const body = req.body;
          const pretty = req.query.pretty;

          const data = await solvePool.exec('solveIngredient', [name, body, pretty]);
          res.json(data);
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const SolveRouter = new SolveRouterImpl();
