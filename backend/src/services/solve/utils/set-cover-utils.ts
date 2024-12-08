import { ingredient, IngredientIndexToIntAmount } from 'sleepapi-common';

export function addSpotsLeftToRecipe(recipe: IngredientIndexToIntAmount, depth: number) {
  const recipeWithSpotsLeft = new Int16Array(recipe.length + 1);
  recipeWithSpotsLeft.set(recipe);
  recipeWithSpotsLeft[recipeWithSpotsLeft.length - 1] = depth;
  return recipeWithSpotsLeft;
}

export function findSortedRecipeIngredientIndices(recipe: IngredientIndexToIntAmount): number[] {
  // Collect indices and values as pairs
  const sortedIndices: Array<[number, number]> = [];
  for (let i = 0; i < recipe.length; i++) {
    if (recipe[i] > 0) {
      sortedIndices.push([i, recipe[i]]);
    }
  }

  // Sort pairs by the amount * ingredient value in descending order
  sortedIndices.sort((a, b) => b[1] * ingredient.INGREDIENTS[b[0]].value - a[1] * ingredient.INGREDIENTS[a[0]].value);

  // Allocate an Int16Array to store the sorted indices
  const result: number[] = Array(sortedIndices.length);
  for (let i = 0; i < sortedIndices.length; i++) {
    result[i] = sortedIndices[i][0];
  }

  return result;
}

export function createMemoKey(arr: Int16Array): number {
  let hash = 2166136261; // FNV-1a hash seed
  for (let i = 0; i < arr.length; i++) {
    // XOR with the current integer value, cast to 32-bit to avoid sign-extension issues
    hash ^= arr[i] & 0xffff; // Mask with 0xffff to handle the 16-bit integer properly
    hash = (hash * 16777619) | 0; // Multiply by the FNV prime, keeping within 32-bit range
  }
  return hash >>> 0; // Ensure the result is a positive 32-bit unsigned integer
}

export function subtractAndCount(
  recipeWithSpotsLeft: IngredientIndexToIntAmount,
  producedIngredients: IngredientIndexToIntAmount,
  ingredientIndices: number[]
) {
  const recipeWithSpotsLeftLength = recipeWithSpotsLeft.length;
  const remainingRecipeWithSpotsLeft = new Int16Array(recipeWithSpotsLeftLength);
  remainingRecipeWithSpotsLeft[recipeWithSpotsLeftLength] = recipeWithSpotsLeft[recipeWithSpotsLeftLength];
  const remainingIngredientIndices = [];

  let sumRemainingRecipeIngredients = 0;

  for (let i = 0; i < ingredientIndices.length; ++i) {
    const ingredientIndex = ingredientIndices[i];
    const ingredientLeftInRecipe = recipeWithSpotsLeft[ingredientIndex] - producedIngredients[ingredientIndex];

    if (ingredientLeftInRecipe !== 0) {
      remainingRecipeWithSpotsLeft[ingredientIndex] = ingredientLeftInRecipe;
      sumRemainingRecipeIngredients += ingredientLeftInRecipe;
      remainingIngredientIndices.push(ingredientIndex);
    }
  }

  return { remainingRecipeWithSpotsLeft, sumRemainingRecipeIngredients, remainingIngredientIndices };
}
