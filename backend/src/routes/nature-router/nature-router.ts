import NatureController from '@src/controllers/nature/nature.controller.js';
import { Request, Response } from 'express';
import { BaseRouter } from '../base-router.js';

class NatureRouterImpl {
  public async register(controller: NatureController) {
    BaseRouter.router.get('/nature', async (req: Request, res: Response) => {
      try {
        logger.log('Entered /nature');
        const natureData = await controller.getNatures();

        res.header('Content-Type', 'application/json').send(JSON.stringify(natureData, null, 4));
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const NatureRouter = new NatureRouterImpl();
