import { Request, Response } from 'express';
import { config } from '../../config/config';
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
  pretty: boolean;
  onlyBest: boolean;
  previous: boolean;
}

export interface CreateTierListRequestBody {
  limit50: boolean;
  cyan: boolean;
  taupe: boolean;
  snowdrop: boolean;
  lapis: boolean;
  curry: boolean;
  salad: boolean;
  dessert: boolean;
  minRecipeBonus: number;
  nrOfMeals: number;
}

export interface TieredPokemonCombinationContribution {
  tier: string;
  pokemonCombinationContribution: PokemonCombinationCombinedContribution;
}

class TierlistRouterImpl {
  public async register(controller: TierlistController) {
    BaseRouter.router.post(
      '/tierlist/cooking/create',
      async (
        req: Request<unknown, unknown, CreateTierListRequestBody, { pretty: boolean; onlyBest: boolean }>,
        res: Response
      ) => {
        try {
          Logger.log('Entered /tierlist/cooking/create');

          const secretHeader = req.get('secret');
          if (!config.SECRET || !secretHeader || config.SECRET !== secretHeader) {
            return res.status(401).send('Unauthorized');
          }

          const parsedInput = this.#parseInput(req.body);
          const data = controller.createCookingTierlist(parsedInput);
          const tieredData = this.#assignTiers(data);
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

    BaseRouter.router.get(
      '/tierlist/cooking',
      async (req: Request<unknown, unknown, unknown, GetTierListQueryParams>, res: Response) => {
        try {
          Logger.log('Entered /tierlist/cooking');
          const params: GetTierListQueryParams = {
            tierlistType: req.query.tierlistType,
            limit50: queryAsBoolean(req.query.limit50),
            onlyBest: queryAsBoolean(req.query.onlyBest),
            pretty: queryAsBoolean(req.query.pretty),
            previous: queryAsBoolean(req.query.previous),
          };

          const data = await controller.getCookingTierlist(params);
          const tieredData = this.#assignTiers(data);
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

  #parseInput(input: CreateTierListRequestBody) {
    const parsedInput: CreateTierListRequestBody = {
      limit50: queryAsBoolean(input.limit50),
      minRecipeBonus: input.minRecipeBonus,
      nrOfMeals: input.nrOfMeals,
      cyan: queryAsBoolean(input.cyan),
      taupe: queryAsBoolean(input.taupe),
      snowdrop: queryAsBoolean(input.snowdrop),
      lapis: queryAsBoolean(input.lapis),
      curry: queryAsBoolean(input.curry),
      salad: queryAsBoolean(input.salad),
      dessert: queryAsBoolean(input.dessert),
    };
    return parsedInput;
  }

  #assignTiers(data: PokemonCombinationCombinedContribution[]) {
    const tiers: { tier: string; bucket: number }[] = [
      { tier: 'S', bucket: 0.9 },
      { tier: 'A', bucket: 0.8 },
      { tier: 'B', bucket: 0.8 },
      { tier: 'C', bucket: 0.85 },
      { tier: 'D', bucket: 0.85 },
      { tier: 'E', bucket: 0.9 },
    ];

    let threshold = data[0].combinedContribution.score;

    const tieredEntries: { tier: string; pokemonCombinationContribution: PokemonCombinationCombinedContribution }[] =
      [];
    for (const entry of data) {
      let currentTier = tiers.at(0);
      if (currentTier && entry.combinedContribution.score < currentTier.bucket * threshold) {
        threshold = entry.combinedContribution.score;
        tiers.shift();
        currentTier = tiers.at(0);
      }

      tieredEntries.push({ tier: currentTier?.tier ?? 'F', pokemonCombinationContribution: entry });
    }
    return tieredEntries;
  }
}

export const TierlistRouter = new TierlistRouterImpl();
