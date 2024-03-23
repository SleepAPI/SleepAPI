import OptimalController from '@src/controllers/optimal/optimal.controller';
import { OptimalTeamSolution } from '@src/domain/combination/combination';
import { ProductionStats } from '@src/domain/computed/production';
import { Logger } from '@src/services/logger/logger';
import { WebsiteConverterService } from '@src/services/website-converter/website-converter-service';
import { ScoreResult } from '@src/utils/optimal-utils/optimal-utils';
import { queryAsBoolean } from '@src/utils/routing/routing-utils';
import { Request, Response } from 'express';
import { IngredientSet, PokemonIngredientSet } from 'sleepapi-common';
import { BaseRouter } from '../base-router';

// TODO: this is pretty much same as input prod request from calc
// TODO: either use same, or just slim this down massively since most of this is assumed optimal for set cover and not used from site
export interface InputProductionStatsRequest {
  level?: number;
  nature?: string;
  subskills?: string[];
  island?: string;
  e4eProcs?: number;
  e4eLevel?: number;
  cheer?: number;
  extraHelpful?: number;
  helperBoostProcs?: number;
  helperBoostUnique?: number;
  helperBoostLevel?: number;
  helpingbonus?: number;
  camp?: boolean;
  erb?: number;
  recoveryIncense?: boolean;
  skillLevel?: number;
  mainBedtime?: string;
  mainWakeup?: string;
  maxPotSize?: number;
}

export interface OptimalFlexibleResult {
  pokemonCombination: PokemonIngredientSet;
  scoreResult: ScoreResult;
  input: ProductionStats;
}

export interface OptimalSetResult {
  bonus: number;
  meal: string;
  recipe: IngredientSet[];
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
          Logger.log('Entered /optimal/meal/flexible');

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

    BaseRouter.router.post(
      '/optimal/meal/:name',
      async (
        req: Request<{ name: string }, unknown, InputProductionStatsRequest, { pretty?: boolean }>,
        res: Response
      ) => {
        try {
          Logger.log('Entered /optimal/meal/:name');
          const { pretty } = req.query;
          const mealName = req.params.name;

          const data: OptimalSetResult = controller.getOptimalPokemonForMealRaw(mealName, req.body);

          if (queryAsBoolean(pretty)) {
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
