import { Body, Controller, Path, Post, Route } from 'tsoa';
import { ProductionRequest } from '../../routes/calculator-router/production-router';
import { calculatePokemonProduction } from '../../services/routing-service/production/production-service';

@Route('calculator')
export default class ProductionController extends Controller {
  @Post('/production/{name}')
  public async calculatePokemonProduction(@Path() name: string, @Body() body: ProductionRequest) {
    return calculatePokemonProduction(name, body);
  }
}
