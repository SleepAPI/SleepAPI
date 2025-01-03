import type { SetCoverPokemonSetup } from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import type {
  RecipeSolutions,
  SolveRecipeResult,
  SolveRecipeSolution,
  SubRecipeMeta
} from '@src/services/solve/types/solution-types.js';
import { combineProduction, hashPokemonSetIndexed } from '@src/services/solve/utils/solve-utils.js';
import { TimeUtils } from '@src/utils/time-utils/time-utils.js';
import type { IngredientIndexToIntAmount } from 'sleepapi-common';
import { ingredient } from 'sleepapi-common';

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

/**
 * Checks if this node is regarded as unsolvable.
 * Either recipe is done, timeout is reached or no more space left in the team
 */
export function ifUnsolvableNode(params: {
  spotsLeftInTeam: number;
  ingredientIndices: number[];
  startTime: number;
  timeout: number;
}) {
  const { spotsLeftInTeam, ingredientIndices, startTime, timeout } = params;
  const maybeEmptyRecipe = ingredientIndices.length === 0;
  const maybeTimeOut = TimeUtils.checkTimeout({ startTime, timeout });
  const fullTeam = spotsLeftInTeam === 0;

  return maybeEmptyRecipe || maybeTimeOut || fullTeam;
}

export function subtractAndCount(
  recipeWithSpotsLeft: IngredientIndexToIntAmount,
  producedIngredients: IngredientIndexToIntAmount,
  ingredientIndices: number[]
) {
  const recipeWithSpotsLeftLength = recipeWithSpotsLeft.length;
  const remainingRecipeWithSpotsLeft = new Int16Array(recipeWithSpotsLeftLength);
  // set new array's spots left to old current spots left -1 (subtract this producer since it takes a spot)
  remainingRecipeWithSpotsLeft[recipeWithSpotsLeftLength - 1] = recipeWithSpotsLeft[recipeWithSpotsLeftLength - 1] - 1;
  const remainingIngredientIndices = [];

  let sumRemainingRecipeIngredients = 0;

  for (let i = 0; i < ingredientIndices.length; ++i) {
    const ingredientIndex = ingredientIndices[i];
    const ingredientLeftInRecipe = Math.max(
      0,
      recipeWithSpotsLeft[ingredientIndex] - producedIngredients[ingredientIndex]
    );

    if (ingredientLeftInRecipe !== 0) {
      remainingRecipeWithSpotsLeft[ingredientIndex] = ingredientLeftInRecipe;
      sumRemainingRecipeIngredients += ingredientLeftInRecipe;
      remainingIngredientIndices.push(ingredientIndex);
    }
  }

  return { remainingRecipeWithSpotsLeft, sumRemainingRecipeIngredients, remainingIngredientIndices };
}

/**
 * Creates an array of sub-recipes after subtracting the ingredients provided by the producers.
 *
 * @param recipeWithSpotsLeft - The initial recipe with remaining spots left for ingredients.
 * @param ingredientIndices - The indices of the ingredients to be considered.
 * @param producersOfFirstIngredient - The set of producers for the first ingredient.
 * @returns An array of objects, each containing:
 *   - `remainingRecipeWithSpotsLeft`: The sub-recipe after subtracting the producer's ingredients.
 *   - `remainingIngredientIndices`: The remaining ingredient indices after subtraction.
 *   - `sumRemainingRecipeIngredients`: The sum of the remaining ingredients in the sub-recipe.
 *   - `member`: The producer that was subtracted.
 */
export function sortSubRecipesAfterProducerSubtract(
  recipeWithSpotsLeft: IngredientIndexToIntAmount,
  ingredientIndices: number[],
  producersOfFirstIngredient: SetCoverPokemonSetup[]
): SubRecipeMeta[] {
  const subRecipesAfterProducerSubtract: SubRecipeMeta[] = [];

  for (let i = 0; i < producersOfFirstIngredient.length; ++i) {
    const member = producersOfFirstIngredient[i];

    const { remainingRecipeWithSpotsLeft, remainingIngredientIndices, sumRemainingRecipeIngredients } =
      subtractAndCount(recipeWithSpotsLeft, member.totalIngredients, ingredientIndices);

    subRecipesAfterProducerSubtract.push({
      remainingRecipeWithSpotsLeft,
      remainingIngredientIndices,
      sumRemainingRecipeIngredients,
      member
    });
  }

  // Sort sub-recipes by remaining ingredients (least to most), prioritizing the most promising solution first
  return subRecipesAfterProducerSubtract.sort(
    (a, b) => a.sumRemainingRecipeIngredients - b.sumRemainingRecipeIngredients
  );
}

export function addMemberToSubTeams(teams: RecipeSolutions, subTeams: RecipeSolutions, member: SetCoverPokemonSetup) {
  for (let i = 0; i < subTeams.length; i++) {
    // const copiedSubTeam = subTeams[i];
    const copiedSubTeam = [...subTeams[i]];
    copiedSubTeam.push(member);
    teams.push(copiedSubTeam);
  }
}

/**
 * Formats the result of solving a recipe problem.
 * This calculates and adds each team's combined ingredient production.
 * This also determines whether the solving process was exhaustive.
 *
 * @param solutions - The solutions to the recipe.
 * @param startTime - The start time of the solving process.
 * @param timeout - The timeout duration for the solving process.
 * @returns The formatted result including whether the process was exhaustive and the teams with their produced ingredients.
 */
export function formatResult(params: {
  solutions: RecipeSolutions;
  startTime: number;
  timeout: number;
}): SolveRecipeResult {
  const { solutions, startTime, timeout } = params;

  const foundSolutions: Set<string> = new Set();
  const teams: SolveRecipeSolution[] = [];
  for (const members of solutions) {
    members.sort((a, b) => {
      const hashA = hashPokemonSetIndexed(a.pokemonSet).toString();
      const hashB = hashPokemonSetIndexed(b.pokemonSet).toString();
      return hashA.localeCompare(hashB);
    });

    const foundSolution = members.map((member) => hashPokemonSetIndexed(member.pokemonSet)).join(',');
    if (!foundSolutions.has(foundSolution)) {
      foundSolutions.add(foundSolution);

      const combinedIngredientProduction = combineProduction(members);
      teams.push({
        members,
        producedIngredients: combinedIngredientProduction
      });
    }
  }
  return {
    exhaustive: !TimeUtils.checkTimeout({ startTime, timeout }),
    teams
  };
}
