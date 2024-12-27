import type MainskillController from '@src/controllers/mainskill/mainskill.controller.js';
import { BaseRouter } from '@src/routes/base-router.js';
import type { Request, Response } from 'express';

class MainskillRouterImpl {
  public async register(controller: MainskillController) {
    BaseRouter.router.get(
      '/mainskill/:name',
      async (req: Request<{ name: string }, unknown, unknown, unknown>, res: Response) => {
        try {
          logger.log('Entered /mainskill/:name');
          const mainskillData = await controller.getMainskill(req.params.name);

          res.header('Content-Type', 'application/json').send(JSON.stringify(mainskillData, null, 4));
        } catch (err) {
          logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.get('/mainskill', async (req: Request, res: Response) => {
      try {
        logger.log('Entered /mainskill');
        const mainskillData = await controller.getMainskills();

        res.header('Content-Type', 'application/json').send(JSON.stringify(mainskillData, null, 4));
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const MainskillRouter = new MainskillRouterImpl();
