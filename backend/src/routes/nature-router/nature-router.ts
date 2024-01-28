import NatureController from '@src/controllers/nature/nature.controller';
import { Logger } from '@src/services/logger/logger';
import { Request, Response } from 'express';
import { BaseRouter } from '../base-router';

class NatureRouterImpl {
  public async register(controller: NatureController) {
    BaseRouter.router.get('/nature', async (req: Request, res: Response) => {
      try {
        Logger.log('Entered /nature');
        const natureData = await controller.getNatures();

        res.header('Content-Type', 'application/json').send(JSON.stringify(natureData, null, 4));
      } catch (err) {
        Logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const NatureRouter = new NatureRouterImpl();
