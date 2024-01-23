import { Controller, Get, Queries, Route, Tags } from 'tsoa';
import { GetPokemonQueryParams } from '../../routes/pokemon-router/pokemon-router';
import { getPokemonNames } from '../../utils/pokemon-utils/pokemon-utils';
import { queryAsBoolean } from '../../utils/routing/routing-utils';

@Route('api/pokemon')
export default class PokemonController extends Controller {
  @Get('/')
  @Tags('pokemon')
  public async getPokemon(@Queries() queryParams: GetPokemonQueryParams): Promise<string[]> {
    const params = {
      cyan: queryAsBoolean(queryParams.cyan),
      taupe: queryAsBoolean(queryParams.taupe),
      snowdrop: queryAsBoolean(queryParams.snowdrop),
      lapis: queryAsBoolean(queryParams.lapis),
    };
    return getPokemonNames(params);
  }
}
