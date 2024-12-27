import type MealController from '@src/controllers/meal/meal.controller.js';
import { BaseRouter } from '@src/routes/base-router.js';
import type { Request, Response } from 'express';

export interface MealNamesQueryParams {
  curry?: boolean;
  salad?: boolean;
  dessert?: boolean;
  minRecipeBonus?: number;
  maxPotSize?: number;
}

export interface MealRankingQueryParams {
  limit30?: boolean;
  island?: string;
  pretty?: boolean;
}

class MealRouterImpl {
  public async register(controller: MealController) {
    BaseRouter.router.get(
      '/meal',
      async (req: Request<unknown, unknown, unknown, MealNamesQueryParams>, res: Response) => {
        try {
          logger.log('Entered /meal');
          const meals = await controller.getMeals(req.query);

          res.header('Content-Type', 'application/json').send(JSON.stringify(meals, null, 4));
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
    BaseRouter.router.get(
      '/meal/:name',
      async (req: Request<{ name: string }, unknown, unknown, unknown>, res: Response) => {
        try {
          logger.log('Entered /meal/:name');
          const meals = await controller.getMealWithName(req.params.name);

          res.header('Content-Type', 'application/json').send(JSON.stringify(meals, null, 4));
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const MealRouter = new MealRouterImpl();
