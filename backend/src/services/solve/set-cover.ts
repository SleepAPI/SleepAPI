import { SolveRecipeResult } from '@src/services/solve/solve-service.js';
import {
  ProducersByIngredientIndex,
  SetCoverPokemonSetup
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import { RecipeSolutions, SolveRecipeSolution } from '@src/services/solve/types/solution-types.js';
import {
  addSpotsLeftToRecipe,
  createMemoKey,
  findSortedRecipeIngredientIndices,
  subtractAndCount
} from '@src/services/solve/utils/set-cover-utils.js';
import { combineProduction } from '@src/services/solve/utils/solve-utils.js';
import { ingredient, IngredientIndexToIntAmount } from 'sleepapi-common';

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

    const memoKey = createMemoKey(recipeWithSpotsLeft);
    const maybeSolutions = this.cachedSubRecipeSolves.get(memoKey);
    this.startTime = Date.now();

    if (maybeSolutions) {
      return this.formatResult(maybeSolutions);
    } else {
      const ingredientIndices = findSortedRecipeIngredientIndices(recipe);
      const solutions = this.solve(recipeWithSpotsLeft, ingredientIndices);
      return this.formatResult(solutions);
    }
  }

  private solve(subRecipeWithSpotsLeft: IngredientIndexToIntAmount, ingredientIndices: number[]): RecipeSolutions {
    const memoKey = createMemoKey(subRecipeWithSpotsLeft);
    const maybeCachedSolution = this.cachedSubRecipeSolves.get(memoKey);
    if (maybeCachedSolution) {
      return maybeCachedSolution;
    }

    let spotsLeftInTeam = subRecipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS];

    if (this.shouldStopSearching(spotsLeftInTeam, ingredientIndices)) {
      return [];
    }
    spotsLeftInTeam -= 1; // there was space left in team, and now we're adding 1 new member

    // recipeIngredientIndices is sorted by difficult to solve DESC, grab the most difficult remaining ingredient
    const firstIngredientIndex = ingredientIndices[0];
    const producersOfFirstIngredient = this.producersByIngredientIndex[firstIngredientIndex];

    const subRecipesAfterProducerSubtract = this.createSubRecipesAfterProducerSubtract(
      subRecipeWithSpotsLeft,
      ingredientIndices,
      producersOfFirstIngredient
    );

    // Sort sub-recipes by remaining ingredients (least to most), prioritizing the most promising solution first
    subRecipesAfterProducerSubtract.sort((a, b) => a.sumRemainingRecipeIngredients - b.sumRemainingRecipeIngredients);

    const teams: RecipeSolutions = [];
    for (let i = 0; i < subRecipesAfterProducerSubtract.length; ++i) {
      const { remainingRecipeWithSpotsLeft, remainingIngredientIndices, sumRemainingRecipeIngredients, member } =
        subRecipesAfterProducerSubtract[i];

      if (sumRemainingRecipeIngredients === 0) {
        // if the producer solved the remaining ingredients alone
        if (spotsLeftInTeam !== 0) {
          // reached a solution and should not go deeper
          spotsLeftInTeam = 0;
        }
        teams.concat([member]);
      } else if (spotsLeftInTeam !== 0) {
        // the recipe is not solved and there is room left in the team
        const subTeams = this.solve(remainingRecipeWithSpotsLeft, remainingIngredientIndices);

        if (subTeams.length === 0) {
          // If no teams could solve the sub-recipe, then we continue without adding any solutions to "teams"
          // Should mostly never happen, but might happen if we limit the pool of eligible Pokémon beyond OPTIMAL_POKEDEX
          continue;
        }

        const subRecipeKey = createMemoKey(remainingRecipeWithSpotsLeft);
        this.cachedSubRecipeSolves.set(subRecipeKey, subTeams);

        const subTeamSize = subTeams[0].length;
        if (subTeamSize < spotsLeftInTeam) {
          // we found a solution and it did not require all the spots that were left in the team
          // now we update the spotsLeftInTeam to require being the same max size
          // now we also override the previously found teams, since we found one that required less members
          spotsLeftInTeam = subTeamSize;
          teams.length = 0; // clears teams
          this.addMemberToSubTeams(teams, subTeams, member);
        } else if (subTeamSize === spotsLeftInTeam) {
          // we found a solution and we have previously found solutions of the same size (or we're at max depth)
          // add this solution to the result
          // teams = teams.concat(newTeams);
          this.addMemberToSubTeams(teams, subTeams, member);
        }
      }
    }

    this.cachedSubRecipeSolves.set(memoKey, teams);
    return teams;
  }

  private createSubRecipesAfterProducerSubtract(
    subRecipeWithSpotsLeft: IngredientIndexToIntAmount,
    ingredientIndices: number[],
    producersOfFirstIngredient: SetCoverPokemonSetup[]
  ) {
    const subRecipesAfterProducerSubtract: {
      remainingRecipeWithSpotsLeft: IngredientIndexToIntAmount;
      remainingIngredientIndices: number[];
      sumRemainingRecipeIngredients: number;
      member: SetCoverPokemonSetup;
    }[] = [];

    for (let i = 0; i < producersOfFirstIngredient.length; ++i) {
      const member = producersOfFirstIngredient[i];
      const { remainingRecipeWithSpotsLeft, remainingIngredientIndices, sumRemainingRecipeIngredients } =
        subtractAndCount(subRecipeWithSpotsLeft, member.totalIngredients, ingredientIndices);
      subRecipesAfterProducerSubtract.push({
        remainingRecipeWithSpotsLeft,
        remainingIngredientIndices,
        sumRemainingRecipeIngredients,
        member
      });
    }

    return subRecipesAfterProducerSubtract;
  }

  private addMemberToSubTeams(teams: RecipeSolutions, subTeams: RecipeSolutions, member: SetCoverPokemonSetup) {
    for (let i = 0; i < subTeams.length; i++) {
      // add current member to each subteam
      // add each sub-team to resulting teams
      subTeams[i].push(member);
      teams.push(subTeams[i]);
    }
  }

  // either recipe is done, timeout is reached or no more space in the team
  private shouldStopSearching(spotsLeftInTeam: number, ingredientIndices: number[]) {
    const maybeEmptyRecipe = ingredientIndices.length === 0;
    const maybeTimeOut = this.checkTimeout();
    const fullTeam = spotsLeftInTeam === 0;

    return maybeEmptyRecipe || maybeTimeOut || fullTeam;
  }

  private checkTimeout() {
    if (Date.now() - this.startTime >= this.timeout) {
      return true;
    }
    return false;
  }

  private formatResult(solutions: RecipeSolutions): SolveRecipeResult {
    const teams: SolveRecipeSolution[] = [];
    for (const members of solutions) {
      const combinedIngredientProduction = combineProduction(members);
      teams.push({
        members,
        producedIngredients: combinedIngredientProduction
      });
    }
    return {
      exhaustive: !this.checkTimeout(),
      teams
    };
  }
}
