import { getIngredientNames } from 'sleepapi-common';
import { Controller, Get, Route, Tags } from 'tsoa';

@Route('api/ingredient')
export default class IngredientController extends Controller {
  @Get('/')
  @Tags('ingredient')
  public async getIngredients(): Promise<string[]> {
    return getIngredientNames();
  }
}
