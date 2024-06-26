import ProductionController from '@src/controllers/calculator/production.controller';
import { Logger } from '@src/services/logger/logger';
import { WebsiteConverterService } from '@src/services/website-converter/website-converter-service';
import { queryAsBoolean } from '@src/utils/routing/routing-utils';
import { Request, Response } from 'express';
import { PokemonInstance } from 'sleepapi-common';
import { BaseRouter } from '../base-router';

export interface ProductionRequest {
  level: number;
  nature: string;
  subskills: string[];
  e4eProcs: number;
  e4eLevel: number;
  cheer: number;
  extraHelpful: number;
  helperBoostProcs: number;
  helperBoostUnique: number;
  helperBoostLevel: number;
  helpingbonus: number;
  camp: boolean;
  erb: number;
  recoveryIncense: boolean;
  skillLevel: number;
  mainBedtime: string;
  mainWakeup: string;
  ingredientSet: string[];
  nrOfEvolutions?: number;
}
export interface TeamSettingsRequest {
  camp: boolean;
  bedtime: string;
  wakeup: string;
}
export interface CalculateTeamRequest {
  settings: TeamSettingsRequest;
  members: PokemonInstance[];
}

class ProductionRouterImpl {
  public async register(controller: ProductionController) {
    BaseRouter.router.post(
      '/calculator/production/:name',
      async (req: Request<{ name: string }, unknown, ProductionRequest, { pretty?: boolean }>, res: Response) => {
        try {
          Logger.log('Entered /calculator/production/:name');
          const { name } = req.params;

          const pretty = queryAsBoolean(req.query.pretty);

          const productionDataRaw = await controller.calculatePokemonProduction(name, req.body, pretty);
          const productionData = pretty
            ? WebsiteConverterService.toProductionCalculator(productionDataRaw)
            : productionDataRaw;
          res.header('Content-Type', 'application/json').send(JSON.stringify(productionData, null, 4));
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.post(
      '/calculator/team',
      async (req: Request<unknown, unknown, CalculateTeamRequest, unknown>, res: Response) => {
        try {
          Logger.log('Entered /calculator/team');

          const data = await controller.calculateTeam(req.body);
          res.json(data);
        } catch (err) {
          Logger.error((err as Error).stack);
          res.sendStatus(500);
        }
      }
    );
  }
}

export const ProductionRouter = new ProductionRouterImpl();
