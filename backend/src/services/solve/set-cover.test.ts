import { SetCover } from '@src/services/solve/set-cover.js';
import {
  ProducersByIngredientIndex,
  SetCoverPokemonSetup
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import { RecipeSolutions, SubRecipeMeta } from '@src/services/solve/types/solution-types.js';
import * as setCoverUtils from '@src/services/solve/utils/set-cover-utils.js';
import { mocks } from '@src/vitest/index.js';
import { ingredient, IngredientIndexToIntAmount, ingredientSetToIntFlat } from 'sleepapi-common';
import { vimic } from 'vimic';

describe('SetCover', () => {
  let setCover: SetCover;
  let producersByIngredientIndex: ProducersByIngredientIndex;
  let cachedSubRecipeSolves: Map<number, RecipeSolutions>;

  beforeEach(() => {
    producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);

    cachedSubRecipeSolves = new Map();
    setCover = new SetCover(producersByIngredientIndex, cachedSubRecipeSolves);
  });

  describe('solveRecipe', () => {
    it('should return cached solutions if available', () => {
      const recipe: IngredientIndexToIntAmount = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
      recipe[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5;
      const maxTeamSize = 3;
      const memoKey = 123;
      const cachedSolutions: RecipeSolutions = [[mocks.setCoverPokemonSetup()]];

      cachedSubRecipeSolves.set(memoKey, cachedSolutions);
      const result = setCover.solveRecipe(recipe, maxTeamSize);

      expect(result).toBeDefined();
      expect(result).toEqual(cachedSolutions);
    });

    it('should solve recipe and cache the result if no cached solutions are available', () => {
      const recipe: IngredientIndexToIntAmount = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
      recipe[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5;
      const maxTeamSize = 3;
      const memoKey = 123;

      const result = setCover.solveRecipe(recipe, maxTeamSize);

      expect(result).toBeDefined();
      expect(cachedSubRecipeSolves.has(memoKey)).toBe(true);
    });

    it('should format the result correctly', () => {
      const recipe: IngredientIndexToIntAmount = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
      recipe[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5;
      const maxTeamSize = 3;

      const result = setCover.solveRecipe(recipe, maxTeamSize);

      expect(result).toHaveProperty('solutions');
      expect(result).toHaveProperty('startTime');
      expect(result).toHaveProperty('timeout');
    });
  });

  describe('solve', () => {
    it('should solve a simple recipe correctly', () => {
      // this test does not require recursive call, the producer can solve the recipe alone

      // generate a pokemon that produces 10 apples
      // and push it into the apple ingredient index in the reverse index lookup
      producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
      const appleProducer: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
        pokemonSet: {
          pokemon: 'member1',
          ingredients: ingredientSetToIntFlat([
            mocks.mockIngredientSet({ amount: 1, ingredient: ingredient.FANCY_APPLE })
          ])
        },
        totalIngredients: ingredientSetToIntFlat([
          mocks.mockIngredientSet({ amount: 5, ingredient: ingredient.FANCY_APPLE })
        ])
      });
      producersByIngredientIndex[0].push(appleProducer);

      cachedSubRecipeSolves = new Map();
      setCover = new SetCover(producersByIngredientIndex, cachedSubRecipeSolves);

      const { solve } = setCover._testAccess();

      const recipeWithSpotsLeft: IngredientIndexToIntAmount = new Int16Array(
        ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1
      );
      recipeWithSpotsLeft[0] = 5; // recipe requires 5 apples, first index is apple
      recipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5; // 5 spots left from start

      const ingredientIndices = [0]; // only apple ingredient index
      const solutions = solve(recipeWithSpotsLeft, ingredientIndices);

      expect(solutions).toHaveLength(1); // one team found

      const firstTeam = solutions[0];

      expect(firstTeam).toHaveLength(1); // team only has one member
      const teamMember = firstTeam[0];

      expect(teamMember.pokemonSet.pokemon).toEqual('member1');
      expect(teamMember.totalIngredients).toEqual(
        Int16Array.from([5, ...Array(ingredient.INGREDIENTS.length - 1).fill(0)])
      );
    });

    it('should return cached solution if available', () => {
      const { solve } = setCover._testAccess();
      const recipe: IngredientIndexToIntAmount = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
      recipe[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5;
      const ingredientIndices = [1, 2, 3];
      const memoKey = 123;
      const cachedSolutions: RecipeSolutions = [[mocks.setCoverPokemonSetup()]];

      cachedSubRecipeSolves.set(memoKey, cachedSolutions);
      const result = solve(recipe, ingredientIndices);

      expect(result).toEqual(cachedSolutions);
    });

    it('should handle unsolvable nodes correctly', () => {
      const { solve } = setCover._testAccess();
      const recipe: IngredientIndexToIntAmount = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
      recipe[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5;
      const ingredientIndices = [1, 2, 3];

      const result = solve(recipe, ingredientIndices);

      expect(result).toBeDefined();
    });
  });

  describe('findTeams', () => {
    it('should find teams correctly', () => {
      const { findTeams } = setCover._testAccess();
      const subRecipesAfterProducerSubtract: SubRecipeMeta[] = [
        {
          remainingRecipeWithSpotsLeft: new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1),
          remainingIngredientIndices: [1, 2, 3],
          sumRemainingRecipeIngredients: 5,
          member: mocks.setCoverPokemonSetup()
        }
      ];
      const spotsLeftInTeam = 3;
      const result = findTeams(subRecipesAfterProducerSubtract, spotsLeftInTeam);
      expect(result).toBeDefined();
    });

    it('should handle case where producer solves remaining ingredients alone', () => {
      const { findTeams } = setCover._testAccess();
      const subRecipesAfterProducerSubtract: SubRecipeMeta[] = [
        {
          remainingRecipeWithSpotsLeft: new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1),
          remainingIngredientIndices: [1, 2, 3],
          sumRemainingRecipeIngredients: 0,
          member: mocks.setCoverPokemonSetup()
        }
      ];
      const spotsLeftInTeam = 3;
      const result = findTeams(subRecipesAfterProducerSubtract, spotsLeftInTeam);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle case where no teams could solve the sub-recipe', () => {
      const { findTeams } = setCover._testAccess();
      const subRecipesAfterProducerSubtract: SubRecipeMeta[] = [
        {
          remainingRecipeWithSpotsLeft: new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1),
          remainingIngredientIndices: [1, 2, 3],
          sumRemainingRecipeIngredients: 5,
          member: mocks.setCoverPokemonSetup()
        }
      ];
      const spotsLeftInTeam = 0;
      const result = findTeams(subRecipesAfterProducerSubtract, spotsLeftInTeam);
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('ifStopSearching', () => {
    it('should stop searching if conditions are met', () => {
      const { ifStopSearching } = setCover._testAccess();
      const params = {
        memoKey: 123,
        spotsLeftInTeam: 2,
        ingredientIndices: [1, 2, 3]
      };

      const mock = vimic(setCoverUtils, 'ifUnsolvableNode', () => false);

      const result = ifStopSearching(params);

      expect(result).toBeUndefined();
      expect(mock).toHaveBeenCalledWith({
        spotsLeftInTeam: 2,
        ingredientIndices: [1, 2, 3],
        startTime: expect.any(Number),
        timeout: expect.any(Number)
      });
    });

    it('should return cached solution if available', () => {
      const params = {
        memoKey: 123,
        spotsLeftInTeam: 2,
        ingredientIndices: [1, 2, 3]
      };
      const cachedSolutions: RecipeSolutions = [[mocks.setCoverPokemonSetup()]];

      cachedSubRecipeSolves.set(params.memoKey, cachedSolutions);
      setCover = new SetCover(producersByIngredientIndex, cachedSubRecipeSolves);
      const { ifStopSearching } = setCover._testAccess();

      const result = ifStopSearching(params);

      expect(result).toEqual(cachedSolutions);
    });

    it('should return empty array if node is unsolvable', () => {
      const { ifStopSearching } = setCover._testAccess();
      const params = {
        memoKey: 123,
        spotsLeftInTeam: 0,
        ingredientIndices: [1, 2, 3]
      };

      const mock = vimic(setCoverUtils, 'ifUnsolvableNode', () => true);

      const result = ifStopSearching(params);

      expect(result).toEqual([]);
      expect(mock).toHaveBeenCalledWith({
        spotsLeftInTeam: 0,
        ingredientIndices: [1, 2, 3],
        startTime: expect.any(Number),
        timeout: expect.any(Number)
      });
    });
  });
});
