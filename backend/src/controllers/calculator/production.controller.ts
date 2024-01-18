import { Body, Controller, Path, Post, Route, Tags } from 'tsoa';
import { ProductionRequest } from '../../routes/calculator-router/production-router';
import { calculatePokemonProduction } from '../../services/api-service/production/production-service';

@Route('api/calculator')
@Tags('calculator')
export default class ProductionController extends Controller {
  @Post('production/{name}')
  public async calculatePokemonProduction(@Path() name: string, @Body() body: ProductionRequest) {
    return calculatePokemonProduction(name, body);
  }
}
