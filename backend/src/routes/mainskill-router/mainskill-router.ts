import MainskillController from '@src/controllers/mainskill/mainskill.controller';
import { Request, Response } from 'express';
import { Logger } from '../../services/logger/logger';
import { BaseRouter } from '../base-router';

class MainskillRouterImpl {
  public async register(controller: MainskillController) {
    BaseRouter.router.get(
      '/mainskill/:name',
      async (req: Request<{ name: string }, unknown, unknown, unknown>, res: Response) => {
        try {
          Logger.log('Entered /mainskill/:name');
          const mainskillData = await controller.getMainskill(req.params.name);

          res.header('Content-Type', 'application/json').send(JSON.stringify(mainskillData, null, 4));
        } catch (err) {
          Logger.error(err as Error);
          res.status(500).send('Something went wrong');
        }
      }
    );

    BaseRouter.router.get('/mainskill', async (req: Request, res: Response) => {
      try {
        Logger.log('Entered /mainskill');
        const mainskillData = await controller.getMainskills();

        res.header('Content-Type', 'application/json').send(JSON.stringify(mainskillData, null, 4));
      } catch (err) {
        Logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const MainskillRouter = new MainskillRouterImpl();
