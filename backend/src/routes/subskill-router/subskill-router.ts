import type SubskillController from '@src/controllers/subskill/subskill.controller.js';
import { BaseRouter } from '@src/routes/base-router.js';
import type { Request, Response } from 'express';

class SubskillRouterImpl {
  public async register(controller: SubskillController) {
    BaseRouter.router.get(
      '/subskill/:name',
      async (req: Request<{ name: string }, unknown, unknown, unknown>, res: Response) => {
        try {
          logger.log('Entered /subskill/:name');
          const subskillData = await controller.getSubskill(req.params.name);

          res.header('Content-Type', 'application/json').send(JSON.stringify(subskillData, null, 4));
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.get('/subskill', async (req: Request, res: Response) => {
      try {
        logger.log('Entered /subskill');
        const subskillData = await controller.getSubskills();

        res.header('Content-Type', 'application/json').send(JSON.stringify(subskillData, null, 4));
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const SubskillRouter = new SubskillRouterImpl();
