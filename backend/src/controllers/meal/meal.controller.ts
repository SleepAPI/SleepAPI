import { Controller, Get, Path, Queries, Route } from 'tsoa';
import { RankingsForMealQueryParams } from '../../routes/meal-router/meal-router';
import { getMealDataAndRankingFor, getMealNamesForFilter } from '../../services/routing-service/meal-ranking';
import { SelectedMealQueryParams, queryAsBoolean } from '../../utils/routing/routing-utils';

@Route('meal')
export default class MealController extends Controller {
  @Get('/')
  public async getMeals(@Queries() queryParams: SelectedMealQueryParams): Promise<string[]> {
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

  @Get('{name}')
  public async getMealRankingRaw(@Path() name: string, @Queries() queryParams: RankingsForMealQueryParams) {
    const params = {
      name: name,
      limit30: queryAsBoolean(queryParams.limit30),
      cyan: queryAsBoolean(queryParams.cyan),
      taupe: queryAsBoolean(queryParams.taupe),
      snowdrop: queryAsBoolean(queryParams.snowdrop),
    };
    return getMealDataAndRankingFor(params);
  }
}
