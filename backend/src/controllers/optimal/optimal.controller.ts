import { Controller, Get, Path, Queries, Route } from 'tsoa';
import { FilteredQueryParams } from '../../routes/optimal-router/optimal-router';
import { getOptimalPokemonFor } from '../../services/routing-service/optimal-ranking';
import { findIslandForName } from '../../utils/island-utils/island-utils';
import { queryAsBoolean, queryAsMandatoryNumber, queryAsNumber } from '../../utils/routing/routing-utils';

@Route('optimal')
export default class OptimalController extends Controller {
  @Get('{name}')
  public getOptimalPokemonForMealRaw(@Path() name: string, @Queries() queryParams: FilteredQueryParams) {
    const params = {
      name,
      level: queryAsMandatoryNumber('level', queryParams.level),
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
