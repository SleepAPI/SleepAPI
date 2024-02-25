import ShareController from '@src/controllers/share/share.controller';
import { Request, Response } from 'express';
import { Logger } from '../../services/logger/logger';
import { BaseRouter } from '../base-router';

export interface ShareParams {
  pokemon: string;
}

class ShareRouterImpl {
  public async register(controller: ShareController) {
    BaseRouter.router.get('/share', async (req: Request<unknown, unknown, unknown, ShareParams>, res: Response) => {
      try {
        Logger.log('Entered /share');
        const shareHtml = await controller.getCustomSite(req.query, req);
        res.send(shareHtml);
      } catch (err) {
        Logger.error(err as Error);
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
