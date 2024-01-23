import { Controller, Get, Queries, Route, Tags } from 'tsoa';
import { MealNamesQueryParams } from '../../routes/meal-router/meal-router';
import { getMealsForFilter } from '../../utils/meal-utils/meal-utils';
import { queryAsBoolean } from '../../utils/routing/routing-utils';

@Route('api/meal')
export default class MealController extends Controller {
  @Get('/')
  @Tags('meal')
  public async getMeals(@Queries() queryParams: MealNamesQueryParams): Promise<string[]> {
    const params = {
      curry: queryAsBoolean(queryParams.curry),
      salad: queryAsBoolean(queryParams.salad),
      dessert: queryAsBoolean(queryParams.dessert),
    };
    return getMealsForFilter(params).map((meal) => meal.name);
  }
}
