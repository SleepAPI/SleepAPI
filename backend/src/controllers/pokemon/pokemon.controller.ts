import { GetPokemonQueryParams } from '@src/routes/pokemon-router/pokemon-router';
import { getPokemonNames } from '@src/utils/pokemon-utils/pokemon-utils';
import { queryAsBoolean } from '@src/utils/routing/routing-utils';
import { getPokemon, pokemon } from 'sleepapi-common';
import { Controller, Get, Path, Queries, Route, Tags } from 'tsoa';

@Route('api/pokemon')
@Tags('pokemon')
export default class PokemonController extends Controller {
  @Get('/{name}')
  public async getPokemonWithName(@Path() name: string): Promise<pokemon.Pokemon> {
    return getPokemon(name);
  }

  @Get('/')
  public async getPokemon(@Queries() queryParams: GetPokemonQueryParams): Promise<string[]> {
    const params = {
      cyan: queryAsBoolean(queryParams.cyan),
      taupe: queryAsBoolean(queryParams.taupe),
      snowdrop: queryAsBoolean(queryParams.snowdrop),
      lapis: queryAsBoolean(queryParams.lapis),
      powerplant: queryAsBoolean(queryParams.powerplant),
    };
    return getPokemonNames(params);
  }
}
