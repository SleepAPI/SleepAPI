import { Request, Response } from 'express';
import SubskillController from '../../controllers/subskill/subskill.controller.js';
import { BaseRouter } from '../base-router.js';

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
