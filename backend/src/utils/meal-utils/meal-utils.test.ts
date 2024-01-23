import { MealError } from '../../domain/error/meal/meal-error';
import { CURRIES } from '../../domain/recipe/curry';
import { DESSERTS, LOVELY_KISS_SMOOTHIE } from '../../domain/recipe/dessert';
import { MEALS } from '../../domain/recipe/meal';
import { SALADS } from '../../domain/recipe/salad';
import { getMeal, getMealsForFilter } from './meal-utils';

describe('getMeal', () => {
  it('shall return Lovely Kiss for lovely_kIsS_smOOthie name', () => {
    expect(getMeal('lovely_kIsS_smOOthie')).toBe(LOVELY_KISS_SMOOTHIE);
  });

  it("shall throw if Meal can't be found", () => {
    expect(() => getMeal('missing')).toThrow(MealError);
  });
});

describe('getMealsForFilter', () => {
  it('should return curry meals when curry is true', () => {
    expect(
      getMealsForFilter({
        curry: true,
        salad: false,
        dessert: false,
      })
    ).toEqual(CURRIES);
  });

  it('should return salad meals when salad is true', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: true,
        dessert: false,
      })
    ).toEqual(SALADS);
  });

  it('should return dessert meals when dessert is true', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: true,
      })
    ).toEqual(DESSERTS);
  });

  it('should return all meals when no specific filters are applied', () => {
    expect(
      getMealsForFilter({
        curry: false,
        salad: false,
        dessert: false,
      })
    ).toEqual(MEALS);
  });
});
