import { SolveRecipeResult } from '@src/services/solve/solve-service.js';
import { combineProduction } from '@src/services/solve/solve-utils.js';
import {
  ingredient,
  IngredientIndexToIntAmount,
  PokemonWithIngredientsIndexed,
  TeamMemberSettingsExt
} from 'sleepapi-common';

export interface SetCoverPokemonSetup {
  pokemonSet: PokemonWithIngredientsIndexed;
  totalIngredients: IngredientIndexToIntAmount;
}
export interface SetCoverPokemonSetupWithSettings extends SetCoverPokemonSetup {
  settings: TeamMemberSettingsExt;
}

export type IngredientProducers = SetCoverPokemonSetup[];
export type IngredientProducersWithSettings = SetCoverPokemonSetupWithSettings[];
/**
 * Represents a mapping of ingredient indices to their respective producers.
 * Each index corresponds to an ingredient from the @INGREDIENTS array.
 * Producers are sorted in descending order of production amount.
 */
export type ProducersByIngredientIndex = IngredientProducers[];
export type RecipeSolutions = ProducersByIngredientIndex;
export interface SolveRecipeSolution {
  members: IngredientProducers;
  producedIngredients: IngredientIndexToIntAmount;
}
export interface SolveRecipeSolutionWithSettings {
  members: IngredientProducersWithSettings;
  producedIngredients: IngredientIndexToIntAmount;
}

export interface MemoizedParameters {
  remainingIngredients: IngredientIndexToIntAmount;
  spotsLeftInTeam: number;
}

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
    const recipeWithSpotsLeft = this.addSpotsLeftToRecipe(recipe, maxTeamSize);

    const memoKey = this.createMemoKey(recipeWithSpotsLeft);
    const maybeSolutions = this.cachedSubRecipeSolves.get(memoKey);
    this.startTime = Date.now();

    if (maybeSolutions) {
      return this.formatResult(maybeSolutions);
    } else {
      const ingredientIndices = this.findSortedRecipeIngredientIndices(recipe);
      const solutions = this.solve(recipeWithSpotsLeft, ingredientIndices);
      return this.formatResult(solutions);
    }
  }

  private solve(subRecipeWithSpotsLeft: IngredientIndexToIntAmount, ingredientIndices: number[]): RecipeSolutions {
    const memoKey = this.createMemoKey(subRecipeWithSpotsLeft);
    const maybeCachedSolution = this.cachedSubRecipeSolves.get(memoKey);
    if (maybeCachedSolution) {
      return maybeCachedSolution;
    }

    let spotsLeftInTeam = subRecipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS];

    if (this.shouldStopSearching(spotsLeftInTeam, ingredientIndices)) {
      return [];
    }
    spotsLeftInTeam -= 1; // there was space left in team, and now we're adding 1 new member

    // TODO: dont forget to remove the ingredient index from array once it reaches 0, can use shift

    // recipeIngredientIndices is sorted by difficult to solve DESC, grab the most difficult remaining ingredient
    const firstIngredientIndex = ingredientIndices[0];
    const producersOfFirstIngredient = this.producersByIngredientIndex[firstIngredientIndex];

    // TODO: move to function
    const subRecipesAfterProducerSubtract: {
      remainingRecipeWithSpotsLeft: IngredientIndexToIntAmount;
      remainingIngredientIndices: number[];
      sumRemainingRecipeIngredients: number;
      member: SetCoverPokemonSetup;
    }[] = [];
    for (let i = 0; i < producersOfFirstIngredient.length; ++i) {
      const member = producersOfFirstIngredient[i];
      // TODO: if one of these members actually solves the ingredient, then we can break here already, dont need to calc all
      const { remainingRecipeWithSpotsLeft, remainingIngredientIndices, sumRemainingRecipeIngredients } =
        this.subtractAndCount(subRecipeWithSpotsLeft, member.totalIngredients, ingredientIndices);
      subRecipesAfterProducerSubtract.push({
        remainingRecipeWithSpotsLeft,
        remainingIngredientIndices,
        sumRemainingRecipeIngredients,
        member
      });
    }

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

        const subRecipeKey = this.createMemoKey(remainingRecipeWithSpotsLeft);
        this.cachedSubRecipeSolves.set(subRecipeKey, subTeams);

        const subTeamSize = subTeams[0].length;
        // const newTeams = subTeams.map((s) => s.concat(member));
        if (subTeamSize < spotsLeftInTeam) {
          // we found a solution and it did not require all the spots that were left in the team
          // now we update the spotsLeftInTeam to require being the same max size
          // now we also override the previously found teams, since we found one that required less members
          spotsLeftInTeam = subTeamSize;
          // teams = newTeams;
          teams.length = 0; // clears teams
          // TODO: move to function
          for (let i = 0; i < subTeams.length; i++) {
            // add current member to each subteam
            // add each sub-team to resulting teams
            subTeams[i].push(member);
            teams.push(subTeams[i]);
          }
        } else if (subTeamSize === spotsLeftInTeam) {
          // we found a solution and we have previously found solutions of the same size (or we're at max depth)
          // add this solution to the result
          // teams = teams.concat(newTeams);
          for (let i = 0; i < subTeams.length; i++) {
            subTeams[i].push(member); // Mutate subTeam directly by adding the member
            teams.push(subTeams[i]); // Add mutated subTeam to `teams`
          }
        }
      }
    }

    this.cachedSubRecipeSolves.set(memoKey, teams);
    return teams;
  }

  private addSpotsLeftToRecipe(recipe: IngredientIndexToIntAmount, depth: number) {
    const recipeWithSpotsLeft = new Int16Array(recipe.length + 1);
    recipeWithSpotsLeft.set(recipe);
    recipeWithSpotsLeft[recipeWithSpotsLeft.length - 1] = depth;
    return recipeWithSpotsLeft;
  }

  private findSortedRecipeIngredientIndices(recipe: IngredientIndexToIntAmount): number[] {
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

  // FIXME comments, maybe move out?
  private createMemoKey(arr: Int16Array): number {
    let hash = 2166136261; // FNV-1a hash seed
    for (let i = 0; i < arr.length; i++) {
      // XOR with the current integer value, cast to 32-bit to avoid sign-extension issues
      hash ^= arr[i] & 0xffff; // Mask with 0xffff to handle the 16-bit integer properly
      hash = (hash * 16777619) | 0; // Multiply by the FNV prime, keeping within 32-bit range
    }
    return hash >>> 0; // Ensure the result is a positive 32-bit unsigned integer
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

  private subtractAndCount(
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
