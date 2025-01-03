import { describe, expect, it } from 'vitest';
import type { IngredientIndexToIntAmount } from '../../domain/ingredient/ingredient';
import { TOTAL_NUMBER_OF_INGREDIENTS } from '../../domain/ingredient/ingredients';
import { commonMocks } from '../../vitest';
import { flatToIngredientSet, ingredientSetToIntFlat } from '../ingredient-utils';
import { recipeCoverage } from './recipe-utils';
describe('recipeCoverage', () => {
  const createExpectedRemainingRecipe = (values: number[]): Int16Array => {
    return new Int16Array([...values, ...Array(TOTAL_NUMBER_OF_INGREDIENTS - values.length).fill(0)]);
  };

  it('should calculate correct coverage when some ingredients match', () => {
    const recipe = ingredientSetToIntFlat(
      commonMocks.recipe({ ingredients: flatToIngredientSet(new Int16Array([0, 10, 5, 0])) }).ingredients
    );
    const ingredients: IngredientIndexToIntAmount = new Int16Array([5, 5, 8, 1]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBeCloseTo(66.67, 2);
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([0, 5, 0, 0]));
    expect(result.sumRemainingIngredients).toBe(5);
  });

  it('should return 100% when all recipe ingredients are fully covered', () => {
    const recipe = ingredientSetToIntFlat(
      commonMocks.recipe({ ingredients: flatToIngredientSet(new Int16Array([5, 10, 15])) }).ingredients
    );
    const ingredients: IngredientIndexToIntAmount = new Int16Array([5, 10, 15]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBe(100);
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([0, 0, 0]));
    expect(result.sumRemainingIngredients).toBe(0);
  });

  it('should not overvalue when ingredients are overcovered', () => {
    const recipe = ingredientSetToIntFlat(
      commonMocks.recipe({ ingredients: flatToIngredientSet(new Int16Array([5, 10, 15])) }).ingredients
    );
    const ingredients: IngredientIndexToIntAmount = new Int16Array([5000, 1000, 1500]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBe(100);
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([0, 0, 0]));
    expect(result.sumRemainingIngredients).toBe(0);
  });

  it('should return 0% when no ingredients are provided', () => {
    const recipe = ingredientSetToIntFlat(
      commonMocks.recipe({ ingredients: flatToIngredientSet(new Int16Array([5, 10, 15])) }).ingredients
    );
    const ingredients: IngredientIndexToIntAmount = new Int16Array([0, 0, 0]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBe(0);
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([5, 10, 15]));
    expect(result.sumRemainingIngredients).toBe(30);
  });

  it('should ignore indices where recipe ingredients are 0', () => {
    const recipe = ingredientSetToIntFlat(
      commonMocks.recipe({ ingredients: flatToIngredientSet(new Int16Array([0, 10, 0, 20])) }).ingredients
    );
    const ingredients: IngredientIndexToIntAmount = new Int16Array([100, 5, 50, 10]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBe(50); // Only 5/10 + 10/20 is considered
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([0, 5, 0, 10]));
    expect(result.sumRemainingIngredients).toBe(15);
  });

  it('should handle an empty recipe gracefully', () => {
    const recipe = ingredientSetToIntFlat(commonMocks.recipe().ingredients);
    const ingredients: IngredientIndexToIntAmount = new Int16Array([]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBe(0);
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([]));
    expect(result.sumRemainingIngredients).toBe(0);
  });

  it('should handle partial coverage of ingredients', () => {
    const recipe = ingredientSetToIntFlat(
      commonMocks.recipe({ ingredients: flatToIngredientSet(new Int16Array([10, 20, 30])) }).ingredients
    );

    const ingredients: IngredientIndexToIntAmount = new Int16Array([5, 25, 10]);

    const result = recipeCoverage(recipe, ingredients);
    expect(result.coverage).toBeCloseTo(58.3, 1);
    expect(result.remainingRecipe).toEqual(createExpectedRemainingRecipe([5, 0, 20]));
    expect(result.sumRemainingIngredients).toBe(25);
  });
});
