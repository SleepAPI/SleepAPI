import { Request, Response } from 'express';
import MealController from '../../controllers/meal/meal.controller';
import { Logger } from '../../services/logger/logger';
import { queryAsBoolean, respondWithCSV } from '../../utils/routing/routing-utils';
import { BaseRouter } from '../base-router';

export interface MealNamesQueryParams {
  curry?: boolean;
  salad?: boolean;
  dessert?: boolean;
  csv?: boolean;
}

export interface MealRankingQueryParams {
  limit30?: boolean;
  island?: string;
  csv?: boolean;
  pretty?: boolean;
}

class MealRouterImpl {
  public async register(controller: MealController) {
    BaseRouter.router.get(
      '/meal',
      async (req: Request<unknown, unknown, unknown, MealNamesQueryParams>, res: Response) => {
        try {
          Logger.log('Entered /meal');
          const meals = await controller.getMeals(req.query);

          if (queryAsBoolean(req.query.csv) === true) {
            const data = 'Name\n' + `${meals.join('\n')}`;
            respondWithCSV(res, data, 'meals');
          } else {
            res.header('Content-Type', 'application/json').send(JSON.stringify(meals, null, 4));
          }
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const MealRouter = new MealRouterImpl();
