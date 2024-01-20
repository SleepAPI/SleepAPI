import { Request, Response } from 'express';
import IngredientController from '../../controllers/ingredient/ingredient.controller';
import { Logger } from '../../services/logger/logger';
import { BaseRouter } from '../base-router';

class IngredientRouterImpl {
  public async register(controller: IngredientController) {
    BaseRouter.router.get('/ingredient', async (req: Request, res: Response) => {
      try {
        Logger.log('Entered /ingredient');
        const ingredientData = await controller.getIngredients();

        res.header('Content-Type', 'application/json').send(JSON.stringify(ingredientData, null, 4));
      } catch (err) {
        Logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const IngredientRouter = new IngredientRouterImpl();
