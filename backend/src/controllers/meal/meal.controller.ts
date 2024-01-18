import { Controller, Get, Path, Queries, Route, Tags } from 'tsoa';
import { MealNamesQueryParams, MealRankingQueryParams } from '../../routes/meal-router/meal-router';
import { getMealDataAndRankingFor, getMealNamesForFilter } from '../../services/api-service/meal-ranking';
import { findIslandForName } from '../../utils/island-utils/island-utils';
import { queryAsBoolean } from '../../utils/routing/routing-utils';

@Route('api/meal')
export default class MealController extends Controller {
  @Get('/')
  @Tags('meal')
  public async getMeals(@Queries() queryParams: MealNamesQueryParams): Promise<string[]> {
    const params = {
      advanced: queryAsBoolean(queryParams.advanced),
      unlocked: queryAsBoolean(queryParams.unlocked),
      lategame: queryAsBoolean(queryParams.lategame),
      curry: queryAsBoolean(queryParams.curry),
      salad: queryAsBoolean(queryParams.salad),
      dessert: queryAsBoolean(queryParams.dessert),
    };
    return getMealNamesForFilter(params);
  }

  // TODO: move to legacy
  @Get('{name}')
  @Tags('legacy')
  public async getMealRankingRaw(@Path() name: string, @Queries() queryParams: MealRankingQueryParams) {
    const params = {
      name: name,
      limit30: queryAsBoolean(queryParams.limit30),
      island: findIslandForName(queryParams.island),
    };
    return getMealDataAndRankingFor(params);
  }
}
