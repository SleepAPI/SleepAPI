import { Request, Response } from 'express';
import ProductionController from '../../controllers/calculator/production.controller';
import { Logger } from '../../services/logger/logger';
import { WebsiteConverterService } from '../../services/website-converter/website-converter-service';
import { queryAsBoolean } from '../../utils/routing/routing-utils';
import { BaseRouter } from '../base-router';

export interface ProductionRequest {
  level: number;
  nature: string;
  subskills: string[];
  e4e: number;
  helpingbonus: number;
  camp: boolean;
  ingredientSet?: string[];
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

          const productionDataRaw = await controller.calculatePokemonProduction(name, req.body);
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
  }
}

export const ProductionRouter = new ProductionRouterImpl();
