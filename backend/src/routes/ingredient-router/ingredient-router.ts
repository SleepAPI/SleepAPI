import type IngredientController from '@src/controllers/ingredient/ingredient.controller.js';
import { BaseRouter } from '@src/routes/base-router.js';
import type { Request, Response } from 'express';

class IngredientRouterImpl {
  public async register(controller: IngredientController) {
    BaseRouter.router.get('/ingredient', async (req: Request, res: Response) => {
      try {
        logger.log('Entered /ingredient');
        const ingredientData = await controller.getIngredients();

        res.header('Content-Type', 'application/json').send(JSON.stringify(ingredientData, null, 4));
      } catch (err) {
        logger.error(err as Error);
        res.status(500).send('Something went wrong');
      }
    });
  }
}

export const IngredientRouter = new IngredientRouterImpl();
