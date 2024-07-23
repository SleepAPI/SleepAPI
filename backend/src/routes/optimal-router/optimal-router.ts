import { OptimalTeamSolution } from '@src/domain/combination/combination';
import { ProductionStats } from '@src/domain/computed/production';
import { Logger } from '@src/services/logger/logger';
import { runWorkerFile } from '@src/services/worker/worker';
import { ScoreResult } from '@src/utils/optimal-utils/optimal-utils';
import { Request, Response } from 'express';
import path from 'path';
import { IngredientSet, PokemonIngredientSet } from 'sleepapi-common';
import workerpool from 'workerpool';
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
  legendary?: string; // TODO: can be remade later to array and renamed, use as "these X mons must be included"
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

export interface IngredientRankerResult {
  ingredient: string;
  filter: ProductionStats;
  teams: OptimalTeamSolution[];
}

const pool = workerpool.pool(path.resolve(__dirname, './optimal-meal-worker.js'), {
  maxWorkers: 1,
});

class OptimalCombinationRouterImpl {
  public async register() {
    BaseRouter.router.post(
      '/optimal/ingredient/:name',
      async (
        req: Request<{ name: string }, unknown, InputProductionStatsRequest, { pretty?: boolean }>,
        res: Response
      ) => {
        try {
          Logger.log('Entered /optimal/ingredient/:name');

          const data = await runWorkerFile(path.resolve(__dirname, './optimal-ingredient-worker.js'), {
            name: req.params.name,
            body: req.body,
            pretty: req.query.pretty,
          });
          res.header('Content-Type', 'application/json').send(JSON.stringify(data, null, 4));
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

          const { name } = req.params;
          const { body } = req;
          const { pretty } = req.query;

          const result = await pool.exec('calculateOptimalMeal', [name, body, pretty]);

          res.header('Content-Type', 'application/json').send(JSON.stringify(result, null, 4));
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const OptimalCombinationRouter = new OptimalCombinationRouterImpl();
