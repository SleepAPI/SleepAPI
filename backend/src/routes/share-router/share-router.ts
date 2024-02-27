import ShareController from '@src/controllers/share/share.controller';
import { Request, Response } from 'express';
import { Logger } from '../../services/logger/logger';
import { BaseRouter } from '../base-router';

// pinsir H/H/A, 2.3H, 7.3A, Skill trigger M, ing find M, help speed M, rash nature, 0 e4e, 0 erb, camp false, 3.9 skill procs
// /share?calc=PINH2X3H0A7X3SMIMHMRAE4E0ERB0C0S3X9
export interface ShareParams {
  // pokemon
  pokemon: string;
  ingredientSet: string; // apple,corn
  // input
  subskills: string; // CSV
  level: number;
  nature: string;
  e4e?: number;
  helpingBonus?: number;
  erb?: number;
  camp?: boolean;
  // output
  skillProcs: number;
  producedIngredients: string; // 2,apple/3,corn // TODO: needs to support ing magnet
}

class ShareRouterImpl {
  public async register(controller: ShareController) {
    BaseRouter.router.get('/share', async (req: Request<unknown, unknown, unknown, ShareParams>, res: Response) => {
      try {
        Logger.log('Entered /share: ' + JSON.stringify(req.query));
        const shareHtml = await controller.getCustomSite(req.query, req);
        res.send(shareHtml);
      } catch (err) {
        Logger.error(err as Error);
        // Logger.error((err as Error).stack);
        res.status(500).send('Something went wrong');
      }
    });

    BaseRouter.router.get('/image', async (req: Request<unknown, unknown, unknown, ShareParams>, res: Response) => {
      try {
        Logger.log('Entered /image');
        const image = await controller.getImage(req.query);
        res.type('png');
        res.send(image);
      } catch (err) {
        Logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const ShareRouter = new ShareRouterImpl();
