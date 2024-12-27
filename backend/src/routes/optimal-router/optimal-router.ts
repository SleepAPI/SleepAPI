import type { OptimalTeamSolution } from '@src/domain/combination/combination.js';
import type { ProductionStats } from '@src/domain/computed/production.js';
import { BaseRouter } from '@src/routes/base-router.js';
import { runWorkerFile } from '@src/services/worker/worker.js';
import type { ScoreResult } from '@src/utils/optimal-utils/optimal-utils.js';
import type { Request, Response } from 'express';
import path from 'path';
import type { IngredientSet, PokemonIngredientSet } from 'sleepapi-common';

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

class OptimalCombinationRouterImpl {
  public async register() {
    BaseRouter.router.post(
      '/optimal/ingredient/:name',
      async (
        req: Request<{ name: string }, unknown, InputProductionStatsRequest, { pretty?: boolean }>,
        res: Response
      ) => {
        try {
          logger.log('Entered /optimal/ingredient/:name');

          const { name } = req.params;
          const { body } = req;
          const { pretty } = req.query;

          const data = await runWorkerFile(path.resolve(__dirname, './optimal-ingredient-worker.js'), {
            name,
            body,
            pretty
          });
          res.json(data);
        } catch (err) {
          logger.error(err as Error);
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
          logger.log('Entered /optimal/meal/:name');

          const { name } = req.params;
          const { body } = req;
          const { pretty } = req.query;

          const data = await runWorkerFile(path.resolve(__dirname, './optimal-meal-worker.js'), {
            name,
            body,
            pretty
          });
          res.json(data);
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const OptimalCombinationRouter = new OptimalCombinationRouterImpl();
