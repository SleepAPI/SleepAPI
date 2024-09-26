import { Recipe } from 'sleepapi-common';
import { Controller, Get, Path, Queries, Route, Tags } from 'tsoa';
import { MealNamesQueryParams } from '../../routes/meal-router/meal-router';
import { getMeal, getMealsForFilter } from '../../utils/meal-utils/meal-utils';
import { queryAsBoolean, queryAsNumber } from '../../utils/routing/routing-utils';

@Route('api/meal')
@Tags('meal')
export default class MealController extends Controller {
  @Get('/{name}')
  public async getMealWithName(@Path() name: string): Promise<Recipe> {
    return getMeal(name);
  }
  @Get('/')
  @Tags('meal')
  public async getMeals(@Queries() queryParams: MealNamesQueryParams): Promise<string[]> {
    const params = {
      curry: queryAsBoolean(queryParams.curry),
      salad: queryAsBoolean(queryParams.salad),
      dessert: queryAsBoolean(queryParams.dessert),
      minRecipeBonus: queryAsNumber(queryParams.minRecipeBonus),
      maxPotSize: queryAsNumber(queryParams.maxPotSize),
    };
    return getMealsForFilter(params).map((meal) => meal.name);
  }
}
