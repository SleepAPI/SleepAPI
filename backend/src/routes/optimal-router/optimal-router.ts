import express, { Request, Response } from 'express';
import { config } from '../../config/config';
import OptimalController from '../../controllers/optimal/optimal.controller';
import { CustomPokemonCombinationWithProduce } from '../../domain/combination/custom';
import { ProductionFilter } from '../../domain/computed/production';
import { IngredientDrop } from '../../domain/produce/ingredient';
import { SubskillSet } from '../../domain/stat/subskill';
import { CSVConverterService } from '../../services/csv-converter/csv-converter-service';
import { Logger } from '../../services/logger/logger';
import { WebsiteConverterService } from '../../services/website-converter/website-converter-service';
import { queryAsBoolean, queryParamsToString, respondWithCSV } from '../../utils/routing/routing-utils';

export interface FilteredQueryParams {
  level?: number;
  island?: string;
  e4e?: number;
  helpingbonus?: number;
  camp?: boolean;
  nature?: string;
  subskills?: SubskillSet;
  pretty?: boolean;
  csv?: boolean;
}

export interface OptimalTeamType {
  sumSurplus: number;
  prettySurplus: string;
  prettyCombinedProduce: string;
  member1: CustomPokemonCombinationWithProduce;
  member2?: CustomPokemonCombinationWithProduce;
  member3?: CustomPokemonCombinationWithProduce;
  member4?: CustomPokemonCombinationWithProduce;
  member5?: CustomPokemonCombinationWithProduce;
}

export interface OptimalSetResult {
  bonus: number;
  meal: string;
  recipe: IngredientDrop[];
  value: number;
  filter: ProductionFilter;
  teams: OptimalTeamType[];
}

class OptimalCombinationRouterImpl {
  public router = express.Router();

  public async register(controller: OptimalController) {
    this.router.get(
      '/optimal/:name',
      async (req: Request<{ name: string }, unknown, unknown, FilteredQueryParams>, res: Response) => {
        try {
          Logger.log('Entered /optimal/:name');
          const { pretty, csv } = req.query;
          const mealName = req.params.name;

          const data: OptimalSetResult = controller.getOptimalPokemonForMealRaw(mealName, req.query);

          if (queryAsBoolean(csv)) {
            if (config.NODE_ENV !== 'DEV') {
              return res.status(500).send('CSV inaccessible for quota reasons, contact admin if you need access');
            }
            const optimalData = CSVConverterService.toOptimalSet(data);
            respondWithCSV(res, optimalData, `optimal-${mealName}${queryParamsToString(req.query)}`);
          } else if (queryAsBoolean(pretty)) {
            const optimalData = WebsiteConverterService.toOptimalSet(data);
            res.header('Content-Type', 'application/json').send(JSON.stringify(optimalData, null, 4));
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

export const OptimalCombinationRouter = new OptimalCombinationRouterImpl();
