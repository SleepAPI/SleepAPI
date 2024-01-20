import { Controller, Get, Route, Tags } from 'tsoa';
import { getIngredientNames } from '../../utils/ingredient-utils/ingredient-utils';

@Route('api/ingredient')
export default class IngredientController extends Controller {
  @Get('/')
  @Tags('ingredient')
  public async getIngredients(): Promise<string[]> {
    return getIngredientNames();
  }
}
