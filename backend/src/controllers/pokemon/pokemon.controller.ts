import { Controller, Get, Path, Queries, Route, Tags } from 'tsoa';
import { Pokemon } from '../../domain/pokemon/pokemon';
import { GetPokemonQueryParams } from '../../routes/pokemon-router/pokemon-router';
import { getPokemon, getPokemonNames } from '../../utils/pokemon-utils/pokemon-utils';
import { queryAsBoolean } from '../../utils/routing/routing-utils';

@Route('api/pokemon')
@Tags('pokemon')
export default class PokemonController extends Controller {
  @Get('/{name}')
  public async getPokemonWithName(@Path() name: string): Promise<Pokemon> {
    return getPokemon(name);
  }

  @Get('/')
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
