import { Controller, Get, Path, Queries, Route } from 'tsoa';
import { getOptimalPokemonFor } from '../../services/routing-service/optimal-ranking';
import { FilteredQueryParams, queryAsBoolean, queryAsNumber } from '../../utils/routing/routing-utils';

@Route('optimal')
export default class OptimalController extends Controller {
  @Get('{name}')
  public getOptimalPokemonForMealRaw(@Path() name: string, @Queries() queryParams: FilteredQueryParams) {
    const params = {
      name,
      limit50: queryAsBoolean(queryParams.limit30),
      e4eProcs: queryAsNumber(queryParams.e4e),
      helpingBonus: queryAsNumber(queryParams.helpingbonus),
      goodCamp: queryAsBoolean(queryParams.camp),
      natureName: queryParams.nature,
      subskillSet: queryParams.subskills,
      cyan: queryAsBoolean(queryParams.cyan),
      taupe: queryAsBoolean(queryParams.taupe),
      snowdrop: queryAsBoolean(queryParams.snowdrop),
    };
    return getOptimalPokemonFor(params);
  }
}
