import { Controller, Get, Hidden, Path, Queries, Route } from 'tsoa';
import { FilteredExtQueryParams } from '../../routes/ranking-router/ranking-router';
import { getBuddyFlexibleRanking, getBuddyRankingFor } from '../../services/routing-service/buddy-ranking';
import { getMealFocusedRanking, getMealGeneralistRanking } from '../../services/routing-service/meal-ranking';
import { FilteredWithMealsQueryParams, queryAsBoolean, queryAsNumber } from '../../utils/routing/routing-utils';

@Route('ranking')
export default class RankingController extends Controller {
  @Get('/meal/flexible')
  public async getMealGeneralistRankingRaw(@Queries() queryParams: FilteredWithMealsQueryParams) {
    const params = {
      limit30: queryAsBoolean(queryParams.limit30),
      advanced: queryAsBoolean(queryParams.advanced),
      unlocked: queryAsBoolean(queryParams.unlocked),
      lategame: queryAsBoolean(queryParams.lategame),
      curry: queryAsBoolean(queryParams.curry),
      salad: queryAsBoolean(queryParams.salad),
      dessert: queryAsBoolean(queryParams.dessert),
      cyan: queryAsBoolean(queryParams.cyan),
      taupe: queryAsBoolean(queryParams.taupe),
      snowdrop: queryAsBoolean(queryParams.snowdrop),
    };
    return getMealGeneralistRanking(params);
  }

  @Get('/meal/focused')
  public async getMealFocusedRankingRaw(@Queries() queryParams: FilteredExtQueryParams) {
    const params = {
      limit30: queryAsBoolean(queryParams.limit30),
      advanced: queryAsBoolean(queryParams.advanced),
      unlocked: queryAsBoolean(queryParams.unlocked),
      lategame: queryAsBoolean(queryParams.lategame),
      curry: queryAsBoolean(queryParams.curry),
      salad: queryAsBoolean(queryParams.salad),
      dessert: queryAsBoolean(queryParams.dessert),
      cyan: queryAsBoolean(queryParams.cyan),
      taupe: queryAsBoolean(queryParams.taupe),
      snowdrop: queryAsBoolean(queryParams.snowdrop),
      nrOfMeals: queryAsNumber(queryParams.nrOfMeals),
    };
    return getMealFocusedRanking(params);
  }

  @Get('/buddy/flexible')
  @Hidden()
  public async getBuddyFlexibleRankingRaw(@Queries() queryParams: FilteredExtQueryParams) {
    const params = {
      limit30: queryAsBoolean(queryParams.limit30),
      advanced: queryAsBoolean(queryParams.advanced),
      unlocked: queryAsBoolean(queryParams.unlocked),
      lategame: queryAsBoolean(queryParams.lategame),
      curry: queryAsBoolean(queryParams.curry),
      salad: queryAsBoolean(queryParams.salad),
      dessert: queryAsBoolean(queryParams.dessert),
      cyan: queryAsBoolean(queryParams.cyan),
      taupe: queryAsBoolean(queryParams.taupe),
      snowdrop: queryAsBoolean(queryParams.snowdrop),
      page: queryAsNumber(queryParams.page),
    };
    return getBuddyFlexibleRanking(params);
  }

  @Get('/buddy/meal/{name}')
  @Hidden()
  public async getBuddyMealRankingRaw(@Path() name: string, @Queries() queryParams: FilteredExtQueryParams) {
    const params = {
      name,
      limit30: queryAsBoolean(queryParams.limit30),
      cyan: queryAsBoolean(queryParams.cyan),
      taupe: queryAsBoolean(queryParams.taupe),
      snowdrop: queryAsBoolean(queryParams.snowdrop),
      page: queryAsNumber(queryParams.page),
    };
    return getBuddyRankingFor(params);
  }
}
