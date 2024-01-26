import { Controller, Get, Path, Queries, Route, Tags } from 'tsoa';
import { Meal } from '../../domain/recipe/meal';
import { MealNamesQueryParams } from '../../routes/meal-router/meal-router';
import { getMeal, getMealsForFilter } from '../../utils/meal-utils/meal-utils';
import { queryAsBoolean } from '../../utils/routing/routing-utils';

@Route('api/meal')
@Tags('meal')
export default class MealController extends Controller {
  @Get('/{name}')
  public async getMealWithName(@Path() name: string): Promise<Meal> {
    return getMeal(name);
  }
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
