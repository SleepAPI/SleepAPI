import { Controller, Get, Path, Queries, Route, Tags } from 'tsoa';
import { GetPokemonQueryParams, MealsForPokemonRequestQueryParams } from '../../routes/pokemon-router/pokemon-router';
import { getPokemonCombinationData } from '../../services/routing-service/pokemon-ranking';
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

  // TODO: move to legacy
  @Get('{name}')
  @Tags('legacy')
  public async getPokemonRankingRaw(@Path() name: string, @Queries() queryParams: MealsForPokemonRequestQueryParams) {
    const params = {
      name: name,
      limit30: queryAsBoolean(queryParams.limit30),
      advanced: queryAsBoolean(queryParams.advanced),
      unlocked: queryAsBoolean(queryParams.unlocked),
      lategame: queryAsBoolean(queryParams.lategame),
      curry: queryAsBoolean(queryParams.curry),
      salad: queryAsBoolean(queryParams.salad),
      dessert: queryAsBoolean(queryParams.dessert),
    };
    return getPokemonCombinationData(params);
  }
}
