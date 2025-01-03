import type { ProducersByIngredientIndex } from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import type { RecipeSolutions, SolveRecipeResult, SubRecipeMeta } from '@src/services/solve/types/solution-types.js';
import {
  addMemberToSubTeams,
  addSpotsLeftToRecipe,
  createMemoKey,
  findSortedRecipeIngredientIndices,
  formatResult,
  ifUnsolvableNode,
  sortSubRecipesAfterProducerSubtract
} from '@src/services/solve/utils/set-cover-utils.js';
import type { IngredientIndexToIntAmount } from 'sleepapi-common';
import { ingredient } from 'sleepapi-common';

// TODO: somehow both teams of size 3 and 4 show up in level 60 defiant result

// TODO: Can we parallelize recursive calls with worker_threads?
export class SetCover {
  private producersByIngredientIndex: ProducersByIngredientIndex;
  private cachedSubRecipeSolves: Map<number, ProducersByIngredientIndex>;

  private startTime: number = Date.now();
  private timeout = 10000;

  constructor(
    producersByIngredientIndex: ProducersByIngredientIndex,
    cachedSubRecipeSolves: Map<number, RecipeSolutions>
  ) {
    this.producersByIngredientIndex = producersByIngredientIndex;
    this.cachedSubRecipeSolves = cachedSubRecipeSolves;
  }

  public solveRecipe(recipe: IngredientIndexToIntAmount, maxTeamSize: number): SolveRecipeResult {
    const recipeWithSpotsLeft = addSpotsLeftToRecipe(recipe, maxTeamSize);

    this.startTime = Date.now();

    const ingredientIndices = findSortedRecipeIngredientIndices(recipe);

    const solutions = this.solve(recipeWithSpotsLeft, ingredientIndices);
    return formatResult({ solutions, startTime: this.startTime, timeout: this.timeout });
  }

  public reset() {
    this.producersByIngredientIndex.length = 0;
    this.cachedSubRecipeSolves.clear();
  }

  private solve(subRecipeWithSpotsLeft: IngredientIndexToIntAmount, ingredientIndices: number[]): RecipeSolutions {
    const memoKey = createMemoKey(subRecipeWithSpotsLeft);
    const spotsLeftInTeam = subRecipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS];

    const maybeCachedSolution = this.ifStopSearching({ memoKey, spotsLeftInTeam, ingredientIndices });
    if (maybeCachedSolution) {
      return maybeCachedSolution;
    }

    // recipeIngredientIndices is sorted by difficult to solve DESC, grab the most difficult remaining ingredient
    const firstIngredientIndex = ingredientIndices[0];
    const producersOfFirstIngredient = this.producersByIngredientIndex[firstIngredientIndex];

    const subRecipesAfterProducerSubtract: SubRecipeMeta[] = sortSubRecipesAfterProducerSubtract(
      subRecipeWithSpotsLeft,
      ingredientIndices,
      producersOfFirstIngredient
    );

    const teams = this.findTeams(subRecipesAfterProducerSubtract);

    this.addCacheEntry(memoKey, teams);
    return teams;
  }

  /**
   * Finds the optimal teams to solve the given sub-recipes.
   *
   * This function iterates through the provided sub-recipes and attempts to find the best possible teams
   * that can solve the remaining ingredients. It uses a recursive approach to explore potential solutions
   * and caches the results to avoid redundant calculations.
   *
   * The function is complex due to its recursive nature and the need to handle multiple edge cases, such as:
   * - When the producer alone can solve the remaining ingredients.
   * - When there are no more spots left in the team.
   * - When a solution is found that requires fewer members than previously found solutions.
   *
   * The recursive call works by invoking the `solve` method on the remaining recipe and ingredient indices.
   * If a valid solution is found, it is cached and used to update the current list of teams.
   *
   * The recursive call ends when a solution is found and `spotsLeftInTeam` is set to 0.
   * Furthermore the solve function itself also checks for cached solutions and if the search should be stopped (timeout, etc).
   *
   * @param subRecipesAfterProducerSubtract - The list of sub-recipes after subtracting the producer's contribution.
   * @param spotsLeftInTeam - The number of spots left in the team.
   * @returns The optimal teams that can solve the given sub-recipes.
   */
  // TODO: missleading function name, all this does is check if we should search deeper or finish the search (add the member to team etc)
  private findTeams(subRecipesAfterProducerSubtract: SubRecipeMeta[]): RecipeSolutions {
    const teams: RecipeSolutions = [];

    // every recipe has same spots left at same depth
    let spotsLeftInTeam =
      subRecipesAfterProducerSubtract[0].remainingRecipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS];

    for (let i = 0; i < subRecipesAfterProducerSubtract.length; ++i) {
      const { remainingRecipeWithSpotsLeft, remainingIngredientIndices, sumRemainingRecipeIngredients, member } =
        subRecipesAfterProducerSubtract[i];

      if (sumRemainingRecipeIngredients === 0) {
        // if the producer solved the remaining ingredients alone
        if (spotsLeftInTeam !== 0) {
          // reached a solution and should not go deeper
          spotsLeftInTeam = 0;
        }
        teams.push([member]); // add new team with only this one member
      } else if (spotsLeftInTeam !== 0) {
        // the recipe is not solved and there is room left in the team
        const subTeams = this.solve(remainingRecipeWithSpotsLeft, remainingIngredientIndices);

        if (subTeams.length === 0) {
          // If no teams could solve the sub-recipe, then we continue without adding any solutions to "teams"
          // Should mostly never happen, but might happen if we limit the pool of eligible Pokémon beyond OPTIMAL_POKEDEX
          continue;
        }

        const subTeamSize = subTeams[0].length;
        if (subTeamSize < spotsLeftInTeam) {
          // we found a solution and it did not require all the spots that were left in the team
          // now we update the spotsLeftInTeam to require being the same max size
          // now we also override the previously found teams, since we found one that required less members
          spotsLeftInTeam = subTeamSize;
          teams.length = 0; // clears teams
          addMemberToSubTeams(teams, subTeams, member); // also adds the subteams to teams
        } else if (subTeamSize === spotsLeftInTeam) {
          // we found a solution and we have previously found solutions of the same size (or we're at max depth)
          // add this solution to the result
          // teams = teams.concat(newTeams);
          addMemberToSubTeams(teams, subTeams, member);
        }
      }
    }

    return teams;
  }
  /*
   * Checks if the solution already exists in the cache or should give up the search.
   * Returns false if we should continue searching.
   */
  private ifStopSearching(params: {
    memoKey: number;
    spotsLeftInTeam: number;
    ingredientIndices: number[];
  }): RecipeSolutions | undefined {
    const { memoKey, spotsLeftInTeam, ingredientIndices } = params;
    const maybeCachedSolution = this.cachedSubRecipeSolves.get(memoKey);
    if (maybeCachedSolution) {
      return maybeCachedSolution;
    }

    const startTime = this.startTime;
    const timeout = this.timeout;

    if (ifUnsolvableNode({ spotsLeftInTeam, ingredientIndices, startTime, timeout })) {
      return [];
    }
  }

  private addCacheEntry(memoKey: number, teams: ProducersByIngredientIndex) {
    if (!this.cachedSubRecipeSolves.has(memoKey)) {
      this.cachedSubRecipeSolves.set(memoKey, teams);
    }
  }

  /**
   * Trick or exposing functions for testing
   */
  public _testAccess() {
    return {
      solve: this.solve.bind(this),
      findTeams: this.findTeams.bind(this),
      ifStopSearching: this.ifStopSearching.bind(this)
    };
  }
}
