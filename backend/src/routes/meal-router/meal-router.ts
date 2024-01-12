import express, { Request, Response } from 'express';
import MealController from '../../controllers/meal/meal.controller';
import { CSVConverterService } from '../../services/csv-converter/csv-converter-service';
import { Logger } from '../../services/logger/logger';
import { WebsiteConverterService } from '../../services/website-converter/website-converter-service';
import { queryAsBoolean, respondWithCSV } from '../../utils/routing/routing-utils';

export interface MealNamesQueryParams {
  advanced?: boolean;
  unlocked?: boolean;
  lategame?: boolean;
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
  public router = express.Router();

  public async register(controller: MealController) {
    this.router.get('/meal', async (req: Request<unknown, unknown, unknown, MealNamesQueryParams>, res: Response) => {
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
    });

    this.router.get(
      '/meal/:name',
      async (req: Request<{ name: string }, unknown, unknown, MealRankingQueryParams>, res: Response) => {
        try {
          Logger.log('Entered /api/meal/:name');
          const { pretty, csv } = req.query;
          const mealName = req.params.name;

          const data = await controller.getMealRankingRaw(mealName, req.query);

          if (queryAsBoolean(csv)) {
            const mealData = CSVConverterService.toMealRanking(data);
            respondWithCSV(res, mealData, mealName);
          } else if (queryAsBoolean(pretty)) {
            const mealData = WebsiteConverterService.toMealRanking(data);
            res.header('Content-Type', 'application/json').send(JSON.stringify(mealData, null, 4));
          } else {
            res.header('Content-Type', 'application/json').send(JSON.stringify(data, null, 4));
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
