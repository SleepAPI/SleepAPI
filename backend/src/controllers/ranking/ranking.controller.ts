import { Controller, Get, Hidden, Path, Queries, Route, Tags } from 'tsoa';
import { FilteredExtQueryParams, FilteredMealsQueryParams } from '../../routes/ranking-router/ranking-router';
import { getBuddyFlexibleRanking, getBuddyRankingFor } from '../../services/routing-service/buddy-ranking';
import { getMealFocusedRanking, getMealGeneralistRanking } from '../../services/routing-service/meal-ranking';
import { queryAsBoolean, queryAsNumber } from '../../utils/routing/routing-utils';

@Route('api/ranking')
@Tags('legacy')
export default class RankingController extends Controller {
  @Get('meal/flexible')
  public async getMealGeneralistRankingRaw(@Queries() queryParams: FilteredMealsQueryParams) {
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
      lapis: queryAsBoolean(queryParams.lapis),
    };
    return getMealGeneralistRanking(params);
  }

  @Get('meal/focused')
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
      lapis: queryAsBoolean(queryParams.lapis),
      nrOfMeals: queryAsNumber(queryParams.nrOfMeals),
    };
    return getMealFocusedRanking(params);
  }

  @Get('buddy/flexible')
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
      lapis: queryAsBoolean(queryParams.lapis),
      page: queryAsNumber(queryParams.page),
    };
    return getBuddyFlexibleRanking(params);
  }

  @Get('buddy/meal/{name}')
  @Hidden()
  public async getBuddyMealRankingRaw(@Path() name: string, @Queries() queryParams: FilteredExtQueryParams) {
    const params = {
      name,
      limit30: queryAsBoolean(queryParams.limit30),
      cyan: queryAsBoolean(queryParams.cyan),
      taupe: queryAsBoolean(queryParams.taupe),
      snowdrop: queryAsBoolean(queryParams.snowdrop),
      lapis: queryAsBoolean(queryParams.lapis),
      page: queryAsNumber(queryParams.page),
    };
    return getBuddyRankingFor(params);
  }
}
