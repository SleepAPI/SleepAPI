import type { MealNamesQueryParams } from '@src/routes/meal-router/meal-router.js';
import { getMeal, getMealsForFilter } from '@src/utils/meal-utils/meal-utils.js';
import { queryAsBoolean, queryAsNumber } from '@src/utils/routing/routing-utils.js';
import * as tsoa from '@tsoa/runtime';
import type { Recipe } from 'sleepapi-common';
const { Controller, Get, Path, Queries, Route, Tags } = tsoa;

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
      maxPotSize: queryAsNumber(queryParams.maxPotSize)
    };
    return getMealsForFilter(params).map((meal) => meal.name);
  }
}
