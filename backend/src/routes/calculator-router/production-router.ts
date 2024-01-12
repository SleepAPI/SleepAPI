import express, { Request, Response } from 'express';
import ProductionController from '../../controllers/calculator/production.controller';
import { Logger } from '../../services/logger/logger';
import { WebsiteConverterService } from '../../services/website-converter/website-converter-service';
import { queryAsBoolean, queryAsNumber } from '../../utils/routing/routing-utils';

export interface ProductionRequest {
  level: number;
  nature: string;
  subskills: string[];
  e4e: number;
  helpingbonus: number;
  camp: boolean;
}

class ProductionRouterImpl {
  public router = express.Router();

  public async register(controller: ProductionController) {
    this.router.post(
      '/calculator/production/:name',
      async (req: Request<{ name: string }, unknown, ProductionRequest, { pretty?: boolean }>, res: Response) => {
        try {
          Logger.log('Entered /calculator/production/:name');
          const { name } = req.params;

          const parsedInput = this.#parseInput(req.body);
          const pretty = queryAsBoolean(req.query.pretty);

          const productionDataRaw = await controller.calculatePokemonProduction(name, parsedInput);
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

  #parseInput(input: ProductionRequest) {
    const parsedInput: ProductionRequest = {
      level: queryAsNumber(input.level) ?? 0,
      nature: input.nature,
      subskills: input.subskills,
      e4e: queryAsNumber(input.e4e) ?? 0,
      helpingbonus: queryAsNumber(input.helpingbonus) ?? 0,
      camp: queryAsBoolean(input.camp),
    };
    return parsedInput;
  }
}

export const ProductionRouter = new ProductionRouterImpl();
