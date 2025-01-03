import type TierlistController from '@src/controllers/tierlist/tierlist.controller.js';
import { BaseRouter } from '@src/routes/base-router.js';
import { WebsiteConverterService } from '@src/services/website-converter/website-converter-service.js';
import { queryAsBoolean } from '@src/utils/routing/routing-utils.js';
import type { Request, Response } from 'express';
import type { TierlistSettings } from 'sleepapi-common';

class TierlistRouterImpl {
  public async register(controller: TierlistController) {
    BaseRouter.router.post(
      '/tierlist/cooking',
      async (req: Request<unknown, unknown, TierlistSettings, { pretty?: string }>, res: Response) => {
        try {
          logger.log('Entered /tierlist/cooking');
          const tieredData = await controller.getCookingTierlist(req.body);
          const cookingTierlist = queryAsBoolean(req.query.pretty)
            ? WebsiteConverterService.toTierList(tieredData)
            : tieredData;
          res.json(cookingTierlist);
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );
  }
}

export const TierlistRouter = new TierlistRouterImpl();
