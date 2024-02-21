import { Request, Response } from 'express';
import TierlistController from '../../controllers/tierlist/tierlist.controller';
import { PokemonCombinationCombinedContribution } from '../../domain/combination/combination';
import { Logger } from '../../services/logger/logger';
import { WebsiteConverterService } from '../../services/website-converter/website-converter-service';
import { queryAsBoolean } from '../../utils/routing/routing-utils';
import { BaseRouter } from '../base-router';

export type TierlistType = 'overall' | 'curry' | 'salad' | 'dessert';
export interface GetTierListQueryParams {
  tierlistType: TierlistType;
  limit50: boolean;
  potLimit: boolean;
  pretty: boolean;
  onlyBest: boolean;
  previous: boolean;
}

export interface CreateTierListRequestBody {
  limit50: boolean;
  curry: boolean;
  salad: boolean;
  dessert: boolean;
  minRecipeBonus?: number;
  maxPotSize?: number;
  nrOfMeals: number;
}

export interface TieredPokemonCombinationContribution {
  tier: string;
  diff?: number;
  pokemonCombinationContribution: PokemonCombinationCombinedContribution;
}

class TierlistRouterImpl {
  public async register(controller: TierlistController) {
    BaseRouter.router.get(
      '/tierlist',
      async (req: Request<unknown, unknown, unknown, GetTierListQueryParams>, res: Response) => {
        try {
          Logger.log('Entered /tierlist');
          const params: GetTierListQueryParams = {
            tierlistType: req.query.tierlistType,
            limit50: queryAsBoolean(req.query.limit50),
            potLimit: queryAsBoolean(req.query.potLimit),
            onlyBest: queryAsBoolean(req.query.onlyBest),
            pretty: queryAsBoolean(req.query.pretty),
            previous: queryAsBoolean(req.query.previous),
          };

          const tieredData: TieredPokemonCombinationContribution[] = await controller.getCookingTierlist(params);
          const cookingTierlist = queryAsBoolean(req.query.pretty)
            ? WebsiteConverterService.toTierList(tieredData)
            : tieredData;
          res.header('Content-Type', 'application/json').send(JSON.stringify(cookingTierlist, null, 4));
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const TierlistRouter = new TierlistRouterImpl();
