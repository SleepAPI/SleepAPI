import { Controller, Get, Path, Queries, Route, Tags } from 'tsoa';
import { FilteredQueryParams } from '../../routes/optimal-router/optimal-router';
import { getOptimalPokemonFor } from '../../services/routing-service/optimal-ranking';
import { findIslandForName } from '../../utils/island-utils/island-utils';
import { queryAsBoolean, queryAsNumber } from '../../utils/routing/routing-utils';

// TODO: rename to team finder
@Route('api/optimal')
@Tags('optimal')
export default class OptimalController extends Controller {
  @Get('{name}')
  public getOptimalPokemonForMealRaw(@Path() name: string, @Queries() queryParams: FilteredQueryParams) {
    const params = {
      name,
      level: queryAsNumber(queryParams.level),
      e4eProcs: queryAsNumber(queryParams.e4e),
      helpingBonus: queryAsNumber(queryParams.helpingbonus),
      goodCamp: queryAsBoolean(queryParams.camp),
      natureName: queryParams.nature,
      subskillSet: queryParams.subskills,
      island: findIslandForName(queryParams.island),
    };
    return getOptimalPokemonFor(params);
  }
}
