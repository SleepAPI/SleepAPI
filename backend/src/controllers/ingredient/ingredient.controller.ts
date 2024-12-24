import * as tsoa from '@tsoa/runtime';
import { getIngredientNames } from 'sleepapi-common';
const { Controller, Route, Tags, Get } = tsoa;

@Route('api/ingredient')
export default class IngredientController extends Controller {
  @Get('/')
  @Tags('ingredient')
  public async getIngredients(): Promise<string[]> {
    return getIngredientNames();
  }
}
