import SubskillController from '@src/controllers/subskill/subskill.controller';
import { Request, Response } from 'express';
import { Logger } from '../../services/logger/logger';
import { BaseRouter } from '../base-router';

class SubskillRouterImpl {
  public async register(controller: SubskillController) {
    BaseRouter.router.get('/subskill', async (req: Request, res: Response) => {
      try {
        Logger.log('Entered /subskill');
        const subskillData = await controller.getSubskills();

        res.header('Content-Type', 'application/json').send(JSON.stringify(subskillData, null, 4));
      } catch (err) {
        Logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const SubskillRouter = new SubskillRouterImpl();
