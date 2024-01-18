import { Request, Response } from 'express';
import { config } from '../../config/config';
import OptimalController from '../../controllers/optimal/optimal.controller';
import { OptimalTeamSolution, PokemonCombination } from '../../domain/combination/combination';
import { ProductionStats } from '../../domain/computed/production';
import { IngredientDrop } from '../../domain/produce/ingredient';
import { SubskillSet } from '../../domain/stat/subskill';
import { CSVConverterService } from '../../services/csv-converter/csv-converter-service';
import { Logger } from '../../services/logger/logger';
import { WebsiteConverterService } from '../../services/website-converter/website-converter-service';
import { ScoreResult } from '../../utils/optimal-utils/optimal-utils';
import { queryAsBoolean, queryParamsToString, respondWithCSV } from '../../utils/routing/routing-utils';
import { BaseRouter } from '../base-router';

// TODO: make it so frontend defaults to checked INGM+helpM+invL
export interface InputProductionStatsRequest {
  level?: number;
  nature?: string;
  subskills?: string[];
  island?: string;
  e4e?: number;
  helpingbonus?: number;
  camp?: boolean;
  optimalSetSolutionLimit?: number;
}

export interface FilteredQueryParams {
  level?: number;
  nature?: string;
  subskills?: SubskillSet;
  island?: string;
  e4e?: number;
  helpingbonus?: number;
  camp?: boolean;
  pretty?: boolean;
  csv?: boolean;
}

export interface OptimalFlexibleResult {
  pokemonCombination: PokemonCombination;
  scoreResult: ScoreResult;
}

export interface OptimalSetResult {
  bonus: number;
  meal: string;
  recipe: IngredientDrop[];
  value: number;
  filter: ProductionStats;
  teams: OptimalTeamSolution[];
}

class OptimalCombinationRouterImpl {
  public async register(controller: OptimalController) {
    BaseRouter.router.post(
      '/optimal/meal/flexible',
      async (req: Request<unknown, unknown, InputProductionStatsRequest, { pretty: boolean }>, res: Response) => {
        try {
          Logger.log('Entered /optimal/meal/pokemon');

          const data: OptimalFlexibleResult[] = controller.getFlexiblePokemon(req.body);

          if (queryAsBoolean(req.query.pretty)) {
            const optimalData = WebsiteConverterService.toOptimalFlexible(data);
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

    BaseRouter.router.get(
      '/optimal/meal/:name',
      async (req: Request<{ name: string }, unknown, unknown, FilteredQueryParams>, res: Response) => {
        try {
          Logger.log('Entered /optimal/meal/:name');
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
