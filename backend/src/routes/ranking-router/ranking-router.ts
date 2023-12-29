import express, { Request, Response } from 'express';
import RankingController from '../../controllers/ranking/ranking.controller';
import { CSVConverterService } from '../../services/csv-converter/csv-converter-service';
import { Logger } from '../../services/logger/logger';
import { WebsiteConverterService } from '../../services/website-converter/website-converter-service';
import {
  FilteredWithMealsQueryParams,
  queryAsBoolean,
  queryParamsToString,
  respondWithCSV,
} from '../../utils/routing/routing-utils';

export interface FilteredExtQueryParams extends FilteredWithMealsQueryParams {
  nrOfMeals?: number;
  page?: number;
}

class RankingRouterImpl {
  public router = express.Router();

  public async register(controller: RankingController) {
    this.router.get(
      '/ranking/meal/flexible',
      async (req: Request<{ name: string }, unknown, unknown, FilteredWithMealsQueryParams>, res: Response) => {
        try {
          Logger.log('Entered /ranking/meal/flexible');
          const { pretty, csv } = req.query;

          const data = await controller.getMealGeneralistRankingRaw(req.query);

          if (queryAsBoolean(csv)) {
            const flexibleData = CSVConverterService.toFlexibleRanking(data);
            respondWithCSV(res, flexibleData, `flexible${queryParamsToString(req.query)}`);
          } else if (queryAsBoolean(pretty)) {
            const flexibleData = WebsiteConverterService.toFlexibleRanking(data);
            res.header('Content-Type', 'application/json').send(JSON.stringify(flexibleData, null, 4));
          } else {
            res.header('Content-Type', 'application/json').send(JSON.stringify(data, null, 4));
          }
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    this.router.get(
      '/ranking/meal/focused',
      async (req: Request<{ name: string }, unknown, unknown, FilteredExtQueryParams>, res: Response) => {
        try {
          Logger.log('Entered /ranking/meal/focused');
          const { pretty, csv } = req.query;

          const data = await controller.getMealFocusedRankingRaw(req.query);

          if (queryAsBoolean(csv)) {
            const focusedData = CSVConverterService.toFocusedRanking(data);
            respondWithCSV(res, focusedData, `focused${queryParamsToString(req.query)}`);
          } else if (queryAsBoolean(pretty)) {
            const focusedData = WebsiteConverterService.toFocusedRanking(data);
            res.header('Content-Type', 'application/json').send(JSON.stringify(focusedData, null, 4));
          } else {
            res.header('Content-Type', 'application/json').send(JSON.stringify(data, null, 4));
          }
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    this.router.get(
      '/ranking/buddy/flexible',
      async (req: Request<{ name: string }, unknown, unknown, FilteredExtQueryParams>, res: Response) => {
        try {
          Logger.log('Entered /ranking/buddy/flexible');
          const { pretty, csv, page } = req.query;

          const data = await controller.getBuddyFlexibleRankingRaw(req.query);

          if (queryAsBoolean(csv)) {
            const flexibleBuddyData = CSVConverterService.toFlexibleBuddyRanking(data, page);
            respondWithCSV(res, flexibleBuddyData, `buddy-flexible${queryParamsToString(req.query)}`);
          } else if (queryAsBoolean(pretty)) {
            const flexibleBuddyData = WebsiteConverterService.toFlexibleBuddyRanking(data, page);
            res.header('Content-Type', 'application/json').send(JSON.stringify(flexibleBuddyData, null, 4));
          } else {
            res.header('Content-Type', 'application/json').send(JSON.stringify(data, null, 4));
          }
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    this.router.get(
      '/ranking/buddy/meal/:name',
      async (req: Request<{ name: string }, unknown, unknown, FilteredExtQueryParams>, res: Response) => {
        try {
          Logger.log('Entered /ranking/meal/buddy/:name');
          const { pretty, csv, page } = req.query;
          const mealName = req.params.name;

          const data = await controller.getBuddyMealRankingRaw(mealName, req.query);

          if (queryAsBoolean(csv)) {
            const mealData = CSVConverterService.toBuddyForMealRanking(data, page);
            respondWithCSV(res, mealData, `buddy-${mealName}${queryParamsToString(req.query)}`);
          } else if (queryAsBoolean(pretty)) {
            const mealData = WebsiteConverterService.toBuddyForMealRanking(data, page);
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

export const RankingRouter = new RankingRouterImpl();
