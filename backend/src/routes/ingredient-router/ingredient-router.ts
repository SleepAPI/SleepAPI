import IngredientController from '@src/controllers/ingredient/ingredient.controller.js';
import { Request, Response } from 'express';
import { BaseRouter } from '../base-router.js';

class IngredientRouterImpl {
  public async register(controller: IngredientController) {
    BaseRouter.router.get('/ingredient', async (req: Request, res: Response) => {
      try {
        logger.log('Entered /ingredient');
        const ingredientData = await controller.getIngredients();
        res.json(ingredientData);
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const IngredientRouter = new IngredientRouterImpl();
