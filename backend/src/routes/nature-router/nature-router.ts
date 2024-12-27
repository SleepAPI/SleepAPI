import type NatureController from '@src/controllers/nature/nature.controller.js';
import { BaseRouter } from '@src/routes/base-router.js';
import type { Request, Response } from 'express';

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
