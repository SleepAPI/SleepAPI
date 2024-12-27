import type TierlistController from '@src/controllers/tierlist/tierlist.controller.js';
import type { PokemonCombinationCombinedContribution } from '@src/domain/combination/combination.js';
import { BaseRouter } from '@src/routes/base-router.js';
import { WebsiteConverterService } from '@src/services/website-converter/website-converter-service.js';
import { queryAsBoolean } from '@src/utils/routing/routing-utils.js';
import type { Request, Response } from 'express';

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
          logger.log('Entered /tierlist');
          const params: GetTierListQueryParams = {
            tierlistType: req.query.tierlistType,
            limit50: queryAsBoolean(req.query.limit50),
            potLimit: queryAsBoolean(req.query.potLimit),
            onlyBest: queryAsBoolean(req.query.onlyBest),
            pretty: queryAsBoolean(req.query.pretty),
            previous: queryAsBoolean(req.query.previous)
          };

          const tieredData: TieredPokemonCombinationContribution[] = await controller.getCookingTierlist(params);
          const cookingTierlist = queryAsBoolean(req.query.pretty)
            ? WebsiteConverterService.toTierList(tieredData)
            : tieredData;
          res.header('Content-Type', 'application/json').send(JSON.stringify(cookingTierlist, null, 4));
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const TierlistRouter = new TierlistRouterImpl();
