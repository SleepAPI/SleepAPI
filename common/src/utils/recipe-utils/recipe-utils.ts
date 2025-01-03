import { MAX_RECIPE_LEVEL } from '../../domain/constants';
import type { IngredientIndexToIntAmount, IngredientSet } from '../../domain/ingredient';
import type { Recipe, RecipeFlat, RecipeType } from '../../domain/recipe';
import { emptyIngredientInventoryFloat } from '../../utils/flat-utils';
import { ING_ID_LOOKUP } from '../ingredient-utils/ingredient-utils';

export function createCurry(params: { name: string; ingredients: IngredientSet[]; bonus: number }): Recipe {
  return createRecipe({ ...params, type: 'curry' });
}

export function createSalad(params: { name: string; ingredients: IngredientSet[]; bonus: number }): Recipe {
  return createRecipe({ ...params, type: 'salad' });
}

export function createDessert(params: { name: string; ingredients: IngredientSet[]; bonus: number }): Recipe {
  return createRecipe({ ...params, type: 'dessert' });
}

export function recipesToFlat<T extends Recipe | Recipe[]>(recipes: T): T extends Recipe[] ? RecipeFlat[] : RecipeFlat {
  const recipeArray: Recipe[] = Array.isArray(recipes) ? recipes : [recipes];

  const result = recipeArray.map((recipe) => {
    const ingredientsFlat = emptyIngredientInventoryFloat();

    recipe.ingredients.forEach((ingredientSet) => {
      const index = ING_ID_LOOKUP[ingredientSet.ingredient.name];
      ingredientsFlat[index] = ingredientSet.amount;
    });

    return {
      name: recipe.name,
      ingredients: ingredientsFlat,
      value: recipe.value,
      valueMax: recipe.valueMax,
      type: recipe.type,
      bonus: recipe.bonus,
      nrOfIngredients: recipe.nrOfIngredients
    };
  });

  return (Array.isArray(recipes) ? result : result[0]) as T extends Recipe[] ? RecipeFlat[] : RecipeFlat;
}

/**
 * Calculates the percentage of the recipe covered by produced ingredients
 */
export function recipeCoverage(recipe: Int16Array, ingredients: IngredientIndexToIntAmount) {
  let totalRecipeAmount = 0;
  let totalCovered = 0;

  const remainingRecipe = new Int16Array(recipe.length);
  let sumRemainingIngredients = 0;

  for (let i = 0; i < recipe.length; i++) {
    const recipeAmount = recipe[i];

    if (recipeAmount > 0) {
      totalRecipeAmount += recipeAmount;

      const covered = Math.min(recipeAmount, ingredients[i]);
      totalCovered += covered;

      const left = Math.max(recipeAmount - covered, 0);
      remainingRecipe[i] = left;
      sumRemainingIngredients += left;
    }
  }

  const coverage = totalRecipeAmount > 0 ? (totalCovered / totalRecipeAmount) * 100 : 0;

  return {
    coverage,
    remainingRecipe,
    sumRemainingIngredients
  };
}

function createRecipe(params: { name: string; ingredients: IngredientSet[]; bonus: number; type: RecipeType }): Recipe {
  const { name, ingredients, bonus, type } = params;
  const nrOfIngredients = ingredients.reduce((sum, cur) => sum + cur.amount, 0);
  return {
    name,
    value: calculateRecipeValue({ level: 1, ingredients, bonus }),
    valueMax: calculateRecipeValue({ level: MAX_RECIPE_LEVEL, ingredients, bonus }),
    type,
    ingredients,
    bonus,
    nrOfIngredients
  };
}

export const recipeLevelBonus: { [level: number]: number } = {
  1: 1,
  2: 1.02,
  3: 1.04,
  4: 1.06,
  5: 1.08,
  6: 1.09,
  7: 1.11,
  8: 1.13,
  9: 1.16,
  10: 1.18,
  11: 1.19,
  12: 1.21,
  13: 1.23,
  14: 1.24,
  15: 1.26,
  16: 1.28,
  17: 1.3,
  18: 1.31,
  19: 1.33,
  20: 1.35,
  21: 1.37,
  22: 1.4,
  23: 1.42,
  24: 1.45,
  25: 1.47,
  26: 1.5,
  27: 1.52,
  28: 1.55,
  29: 1.58,
  30: 1.61,
  31: 1.64,
  32: 1.67,
  33: 1.7,
  34: 1.74,
  35: 1.77,
  36: 1.81,
  37: 1.84,
  38: 1.88,
  39: 1.92,
  40: 1.96,
  41: 2,
  42: 2.04,
  43: 2.08,
  44: 2.13,
  45: 2.17,
  46: 2.22,
  47: 2.27,
  48: 2.32,
  49: 2.37,
  50: 2.42,
  51: 2.48,
  52: 2.53,
  53: 2.59,
  54: 2.65,
  55: 2.71,
  56: 2.77,
  57: 2.83,
  58: 2.9,
  59: 2.97,
  60: 3.03
};

export function calculateRecipeValue(params: { level: number; ingredients: IngredientSet[]; bonus: number }) {
  const { level, ingredients, bonus } = params;

  const ingredientValue = ingredients.reduce((sum, cur) => sum + cur.amount * cur.ingredient.value, 0);
  return Math.round(ingredientValue * recipeLevelBonus[level] * (1 + bonus / 100));
}
