import { mocks } from '@src/bun/index.js';
import type { RecipeSolutions } from '@src/services/solve/types/solution-types.js';
import {
  addMemberToSubTeams,
  addSpotsLeftToRecipe,
  createMemoKey,
  findSortedRecipeIngredientIndices,
  formatResult,
  ifUnsolvableNode,
  sortSubRecipesAfterProducerSubtract,
  subtractAndCount
} from '@src/services/solve/utils/set-cover-utils.js';
import { beforeEach, describe, expect, it } from 'bun:test';
import { ingredient } from 'sleepapi-common';

describe('set-cover-utils', () => {
  let defaultIngredientArray: Int16Array;

  beforeEach(() => {
    defaultIngredientArray = new Int16Array(ingredient.INGREDIENTS.length);
  });

  describe('addSpotsLeftToRecipe', () => {
    it('should add spots left to the recipe', () => {
      defaultIngredientArray.set([1, 2, 3], 0);
      const depth = 5;
      const result = addSpotsLeftToRecipe(defaultIngredientArray, depth);
      expect(result).toEqual(new Int16Array([1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5]));
    });

    it('should handle empty recipe', () => {
      const depth = 3;
      const result = addSpotsLeftToRecipe(defaultIngredientArray, depth);
      expect(result).toEqual(new Int16Array([...defaultIngredientArray, 3]));
    });

    it('should handle zero depth', () => {
      defaultIngredientArray.set([4, 5, 6], 0);
      const depth = 0;
      const result = addSpotsLeftToRecipe(defaultIngredientArray, depth);
      expect(result).toEqual(new Int16Array([4, 5, 6, ...defaultIngredientArray.slice(3), 0]));
    });
  });

  describe('findSortedRecipeIngredientIndices', () => {
    it('should return sorted ingredient indices based on value', () => {
      defaultIngredientArray[0] = 3; // 3 apples * 90 value = 270
      defaultIngredientArray[1] = 2; // 2 milk * 98 value = 200
      defaultIngredientArray[2] = 0; // 0 soybean * 100 value = 0
      defaultIngredientArray[3] = 4; // 4 honey * 101 value = 404
      defaultIngredientArray[16] = 1; // 1 tail * 342 value = 342
      const result = findSortedRecipeIngredientIndices(defaultIngredientArray);
      expect(result).toEqual([3, 16, 0, 1]);
    });

    it('should handle recipe with all zero values', () => {
      const result = findSortedRecipeIngredientIndices(defaultIngredientArray);
      expect(result).toEqual([]);
    });

    it('should handle recipe with one non-zero value', () => {
      defaultIngredientArray[5] = 7; // 7 berries * 50 value = 350
      const result = findSortedRecipeIngredientIndices(defaultIngredientArray);
      expect(result).toEqual([5]);
    });

    it('should handle recipe with multiple same values', () => {
      defaultIngredientArray[2] = 11; // 11 soybean * 100 value = 1100
      defaultIngredientArray[6] = 10; // 10 tomato * 110 value = 1100
      const result = findSortedRecipeIngredientIndices(defaultIngredientArray);
      expect(result).toEqual([2, 6]);
    });
  });

  describe('createMemoKey', () => {
    it('should create a consistent memo key for a given array', () => {
      defaultIngredientArray.set([1, 2, 3, 4, 5], 0);
      const result = createMemoKey(defaultIngredientArray);
      expect(result).toBe(864398780);
    });

    it('should create different memo keys for different arrays', () => {
      defaultIngredientArray.set([1, 2, 3, 4, 5]);
      const result1 = createMemoKey(defaultIngredientArray);

      defaultIngredientArray.set([5, 4, 3, 2, 1]);
      const result2 = createMemoKey(defaultIngredientArray);
      expect(result1).not.toBe(result2);
    });

    it('should create the same memo key for identical arrays', () => {
      const array1 = new Int16Array([1, 2, 3, 4, 5]);
      const array2 = new Int16Array([1, 2, 3, 4, 5]);
      const result1 = createMemoKey(array1);
      const result2 = createMemoKey(array2);
      expect(result1).toBe(result2);
    });

    it('should handle empty arrays', () => {
      const array = new Int16Array([]);
      const result = createMemoKey(array);
      expect(result).toBe(2166136261); // FNV-1a hash seed value
    });
  });

  describe('subtractAndCount', () => {
    it('should subtract produced ingredients, count remaining ingredients and update key index array', () => {
      const depth = 0;
      const recipeWithSpotsLeft = new Int16Array([0, 0, 0, 5, 0, 0, 2, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, depth]);
      const producedIngredients = new Int16Array([0, 0, 0, 5, 0, 0, 1, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0]);

      expect(recipeWithSpotsLeft).toHaveLength(ingredient.INGREDIENTS.length + 1);
      expect(producedIngredients).toHaveLength(ingredient.INGREDIENTS.length);

      const { remainingRecipeWithSpotsLeft, sumRemainingRecipeIngredients, remainingIngredientIndices } =
        subtractAndCount(recipeWithSpotsLeft, producedIngredients, [9, 3, 6]);

      expect(remainingRecipeWithSpotsLeft).toHaveLength(ingredient.INGREDIENTS.length + 1);
      expect(remainingRecipeWithSpotsLeft).toEqual(
        // verify on -1 is fine since in practice we will never call this function with 0 spots, dont want to add additional computational logic for the clamp
        new Int16Array([0, 0, 0, 0, 0, 0, 1, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, -1])
      );
      expect(sumRemainingRecipeIngredients).toBe(6);
      expect(remainingIngredientIndices).toEqual([9, 6]);
    });

    it('should handle case where all ingredients are covered by production', () => {
      const recipeWithSpotsLeft = new Int16Array(ingredient.INGREDIENTS.length + 1);
      recipeWithSpotsLeft.set([5, 3, 2]);
      recipeWithSpotsLeft[ingredient.INGREDIENTS.length] = 5;
      const producedIngredients = new Int16Array(ingredient.INGREDIENTS.length + 1);
      producedIngredients.set([5, 3, 2]);
      const ingredientIndices = [0, 1, 2];

      const result = subtractAndCount(recipeWithSpotsLeft, producedIngredients, ingredientIndices);

      expect(result.remainingRecipeWithSpotsLeft).toHaveLength(ingredient.INGREDIENTS.length + 1);
      expect(result.remainingRecipeWithSpotsLeft).toEqual(
        new Int16Array([...new Array(ingredient.INGREDIENTS.length).fill(0), 4])
      );
      expect(result.sumRemainingRecipeIngredients).toBe(0);
      expect(result.remainingIngredientIndices).toEqual([]);
    });

    it('should handle case where no ingredients are produced', () => {
      defaultIngredientArray.set([5, 3, 2]);
      const producedIngredients = new Int16Array([0, 0, 0]);
      const ingredientIndices = [0, 1, 2];
      const result = subtractAndCount(defaultIngredientArray, producedIngredients, ingredientIndices);
      expect(result.remainingRecipeWithSpotsLeft).toEqual(
        // verify on -1 is fine since in practice we will never call this function with 0 spots, dont want to add additional computational logic for the clamp

        new Int16Array([...defaultIngredientArray.slice(0, defaultIngredientArray.length - 1), -1])
      );
      expect(result.sumRemainingRecipeIngredients).toBe(10);
      expect(result.remainingIngredientIndices).toEqual([0, 1, 2]);
    });

    it('should not subtract production if recipe is empty', () => {
      const producedIngredients = new Int16Array([10, 5, 10]);
      const ingredientIndices: number[] = [];
      const result = subtractAndCount(defaultIngredientArray, producedIngredients, ingredientIndices);
      expect(result.remainingRecipeWithSpotsLeft).toEqual(
        // verify on -1 is fine since in practice we will never call this function with 0 spots, dont want to add additional computational logic for the clamp
        new Int16Array([...defaultIngredientArray.slice(0, defaultIngredientArray.length - 1), -1])
      );
      expect(result.sumRemainingRecipeIngredients).toBe(0);
      expect(result.remainingIngredientIndices).toEqual([]);
    });

    it('should not subtract below 0 remaining ingredients', () => {
      defaultIngredientArray.set([5]); // we dont want this to become -5
      const producedIngredients = new Int16Array([10]);
      const ingredientIndices: number[] = [0];
      const result = subtractAndCount(defaultIngredientArray, producedIngredients, ingredientIndices);
      expect(result.remainingRecipeWithSpotsLeft[0]).toBe(0);
      expect(result.sumRemainingRecipeIngredients).toBe(0);
      expect(result.remainingIngredientIndices).toEqual([]);
    });

    it('should subtact 1 from spots left', () => {
      const recipeWithSpotsLeft = new Int16Array(ingredient.INGREDIENTS.length + 1);
      recipeWithSpotsLeft[ingredient.INGREDIENTS.length] = 3;
      const producedIngredients = new Int16Array([10]);
      const ingredientIndices: number[] = [0];

      const result = subtractAndCount(recipeWithSpotsLeft, producedIngredients, ingredientIndices);
      expect(result.remainingRecipeWithSpotsLeft[ingredient.INGREDIENTS.length]).toBe(2);
    });
  });

  describe('shouldStopSearching', () => {
    it('should return true if ingredient indices are empty', () => {
      const params = {
        spotsLeftInTeam: 5,
        ingredientIndices: [],
        startTime: Date.now(),
        timeout: 1000
      };
      const result = ifUnsolvableNode(params);
      expect(result).toBe(true);
    });

    it('should return true if timeout is reached', () => {
      const params = {
        spotsLeftInTeam: 5,
        ingredientIndices: [1, 2, 3],
        startTime: Date.now() - 2000,
        timeout: 1000
      };
      const result = ifUnsolvableNode(params);
      expect(result).toBe(true);
    });

    it('should return true if no spots left in team', () => {
      const params = {
        spotsLeftInTeam: 0,
        ingredientIndices: [1, 2, 3],
        startTime: Date.now(),
        timeout: 1000
      };
      const result = ifUnsolvableNode(params);
      expect(result).toBe(true);
    });

    it('should return false if none of the conditions are met', () => {
      const params = {
        spotsLeftInTeam: 5,
        ingredientIndices: [1, 2, 3],
        startTime: Date.now(),
        timeout: 1000
      };
      const result = ifUnsolvableNode(params);
      expect(result).toBe(false);
    });
  });

  describe('createSubRecipesAfterProducerSubtract', () => {
    it('should create sub-recipes and sort after producer subtract', () => {
      const subRecipeWithSpotsLeft = new Int16Array(ingredient.INGREDIENTS.length + 1);
      subRecipeWithSpotsLeft.set([5, 3, 2]);
      const ingredientIndices = [0, 1, 2];
      const producersOfFirstIngredient = [
        mocks.setCoverPokemonSetup({ totalIngredients: new Int16Array([2, 1, 1]) }),
        mocks.setCoverPokemonSetup({ totalIngredients: new Int16Array([3, 2, 1]) })
      ];

      const result = sortSubRecipesAfterProducerSubtract(
        subRecipeWithSpotsLeft,
        ingredientIndices,
        producersOfFirstIngredient
      );

      expect(result).toHaveLength(2);

      // expect 2nd team to be first now in results since it has the least amount of ingredients left
      expect(result[0].remainingRecipeWithSpotsLeft).toEqual(
        // verify on -1 is fine since in practice we will never call this function with 0 spots, dont want to add additional computational logic for the clamp
        new Int16Array([2, 1, 1, ...new Int16Array(ingredient.INGREDIENTS.length - 3), -1])
      );
      expect(result[0].remainingIngredientIndices).toEqual([0, 1, 2]);
      expect(result[0].sumRemainingRecipeIngredients).toBe(4);
      expect(result[0].member).toEqual(producersOfFirstIngredient[1]);

      expect(result[1].remainingRecipeWithSpotsLeft).toEqual(
        // verify on -1 is fine since in practice we will never call this function with 0 spots, dont want to add additional computational logic for the clamp
        new Int16Array([3, 2, 1, ...new Int16Array(ingredient.INGREDIENTS.length - 3), -1])
      );
      expect(result[1].remainingIngredientIndices).toEqual([0, 1, 2]);
      expect(result[1].sumRemainingRecipeIngredients).toBe(6);
      expect(result[1].member).toEqual(producersOfFirstIngredient[0]);
    });

    it('should subtract 1 from spots left', () => {
      const subRecipeWithSpotsLeft = new Int16Array(ingredient.INGREDIENTS.length + 1);
      subRecipeWithSpotsLeft.set([5, 3, 2]);
      subRecipeWithSpotsLeft[ingredient.INGREDIENTS.length] = 3;
      const ingredientIndices = [0, 1, 2];
      const producersOfFirstIngredient = [
        mocks.setCoverPokemonSetup({ totalIngredients: new Int16Array([2, 1, 1]) }),
        mocks.setCoverPokemonSetup({ totalIngredients: new Int16Array([3, 2, 1]) })
      ];

      const result = sortSubRecipesAfterProducerSubtract(
        subRecipeWithSpotsLeft,
        ingredientIndices,
        producersOfFirstIngredient
      );
      expect(result).toHaveLength(2);
      result.forEach((subRecipe) => {
        expect(subRecipe.remainingRecipeWithSpotsLeft[ingredient.INGREDIENTS.length]).toBe(2);
      });
    });
  });

  describe('addMemberToSubTeams', () => {
    it('should add member to each sub-team and push to teams', () => {
      const teams: RecipeSolutions = [];
      const subTeams: RecipeSolutions = [
        [
          mocks.setCoverPokemonSetup({
            totalIngredients: new Int16Array([1, 2, 3]),
            pokemonSet: { ingredients: new Int16Array(), pokemon: '1stSubTeamOldMember' }
          })
        ],
        [
          mocks.setCoverPokemonSetup({
            totalIngredients: new Int16Array([4, 5, 6]),
            pokemonSet: { ingredients: new Int16Array(), pokemon: '2ndSubTeamOldMember' }
          })
        ]
      ];
      const newMember = mocks.setCoverPokemonSetup({ totalIngredients: new Int16Array([7, 8, 9]) });

      addMemberToSubTeams(teams, subTeams, newMember);

      expect(teams).toHaveLength(2);
      expect(teams[0]).toEqual([
        {
          totalIngredients: new Int16Array([1, 2, 3]),
          pokemonSet: { ingredients: new Int16Array(), pokemon: '1stSubTeamOldMember' }
        },
        newMember
      ]);
      expect(teams[1]).toEqual([
        {
          totalIngredients: new Int16Array([4, 5, 6]),
          pokemonSet: { ingredients: new Int16Array(), pokemon: '2ndSubTeamOldMember' }
        },
        newMember
      ]);
    });
  });

  describe('formatResult', () => {
    it('should format the result correctly', () => {
      const solutions: RecipeSolutions = [
        [
          mocks.setCoverPokemonSetup({
            totalIngredients: new Int16Array([1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0]),
            pokemonSet: { ingredients: new Int16Array(), pokemon: '1stTeam1stMember' }
          }),
          mocks.setCoverPokemonSetup({
            totalIngredients: new Int16Array([1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
            pokemonSet: { ingredients: new Int16Array(), pokemon: '1stTeam2ndMember' }
          })
        ],
        [
          mocks.setCoverPokemonSetup({
            totalIngredients: new Int16Array([4, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
            pokemonSet: { ingredients: new Int16Array(), pokemon: '2ndTeam1stMember' }
          })
        ]
      ];

      const startTime = Date.now();
      const timeout = 1000;

      const result = formatResult({ solutions, startTime, timeout });

      expect(result.exhaustive).toBe(true);
      expect(result.teams).toHaveLength(2);
      expect(result.teams[0].producedIngredients).toEqual(
        new Int16Array([2, 4, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0])
      );
      expect(result.teams[0].members).toEqual(solutions[0]);
      expect(result.teams[1].members).toEqual(solutions[1]);
    });

    it('should set exhaustive to false if timeout is reached', () => {
      const solutions: RecipeSolutions = [];
      const startTime = Date.now() - 2000;
      const timeout = 1000;

      const result = formatResult({ solutions, startTime, timeout });

      expect(result.exhaustive).toBe(false);
    });
  });
});
