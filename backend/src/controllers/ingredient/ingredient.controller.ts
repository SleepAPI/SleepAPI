import { getIngredientNames } from '@src/utils/ingredient-utils/ingredient-utils';
import { Controller, Get, Route, Tags } from 'tsoa';

@Route('api/ingredient')
export default class IngredientController extends Controller {
  @Get('/')
  @Tags('ingredient')
  public async getIngredients(): Promise<string[]> {
    return getIngredientNames();
  }
}
