import type IngredientController from '@src/controllers/ingredient/ingredient.controller';
import { Logger } from '@src/services/logger/logger';
import type { Request, Response } from 'express';
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
