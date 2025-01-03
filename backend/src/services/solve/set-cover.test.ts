import { mocks } from '@src/bun/index.js';
import { SetCover } from '@src/services/solve/set-cover.js';
import type {
  ProducersByIngredientIndex,
  SetCoverPokemonSetup
} from '@src/services/solve/types/set-cover-pokemon-setup-types.js';
import type { RecipeSolutions, SubRecipeMeta } from '@src/services/solve/types/solution-types.js';
import * as setCoverUtils from '@src/services/solve/utils/set-cover-utils.js';
import type { Mock } from 'bun:test';
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { boozle, unboozle } from 'bunboozle';
import type { IngredientIndexToIntAmount, IngredientSet } from 'sleepapi-common';
import { ingredient, ingredientSetToIntFlat } from 'sleepapi-common';

describe('SetCover', () => {
  let setCover: SetCover;
  let producersByIngredientIndex: ProducersByIngredientIndex;
  let cachedSubRecipeSolves: Map<number, RecipeSolutions>;
  let recipeWithSpotsLeft: IngredientIndexToIntAmount;
  const memoKey = 123;

  let mockedCornKeema: IngredientSet[];

  beforeEach(() => {
    mockedCornKeema = [
      mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.WARMING_GINGER }),
      mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.BEAN_SAUSAGE }),
      mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.GREENGRASS_CORN }),
      mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.FIERY_HERB })
    ];

    recipeWithSpotsLeft = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
    producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
    cachedSubRecipeSolves = new Map();

    setCover = new SetCover(producersByIngredientIndex, cachedSubRecipeSolves);
  });

  describe('solveRecipe', () => {
    let mockedKeyCall: Mock<typeof setCoverUtils.createMemoKey>;
    let recipe: Int16Array;

    beforeEach(() => {
      mockedKeyCall = boozle(setCoverUtils, 'createMemoKey', () => memoKey);
      recipe = recipeWithSpotsLeft.slice(0, ingredient.TOTAL_NUMBER_OF_INGREDIENTS);
    });

    afterEach(() => {
      unboozle();
    });

    it('should return cached solutions if available', () => {
      recipe[0] = 5;
      const maxTeamSize = 3;
      const cachedSolutions: RecipeSolutions = [[mocks.setCoverPokemonSetup()]];

      cachedSubRecipeSolves.set(memoKey, cachedSolutions);
      const result = setCover.solveRecipe(recipe, maxTeamSize);

      expect(result.exhaustive).toBe(true);
      expect(result.teams).toHaveLength(1);
      expect(result.teams[0].members).toHaveLength(1);
      expect(result.teams[0].members[0].pokemonSet.pokemon).toEqual('Mockemon');

      expect(mockedKeyCall).toHaveBeenCalledWith(
        new Int16Array([5, ...Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS - 1).fill(0), maxTeamSize])
      );
    });

    it('should solve recipe and cache the result if no cached solutions are available', () => {
      recipe[0] = 5;
      const maxTeamSize = 3;

      producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
      producersByIngredientIndex[0] = [mocks.setCoverPokemonSetup({ totalIngredients: recipe })];

      setCover = new SetCover(producersByIngredientIndex, cachedSubRecipeSolves);

      const result = setCover.solveRecipe(recipe, maxTeamSize);

      expect(result.exhaustive).toBe(true);
      expect(result.teams).toHaveLength(1);
      expect(result.teams[0].members).toHaveLength(1);
      expect(result.teams[0].members[0].pokemonSet.pokemon).toEqual('Mockemon');

      expect(cachedSubRecipeSolves.has(memoKey)).toBe(true);
    });

    it('should solve realistic Inferno Corn Keema Curry', () => {
      // we really just want 3 unique cache keys, so we don't exit early, just create a new cache key every rec call
      const missingCacheKey = () => -1;
      const firstMemoKey = () => 123;
      const secondMemoKey = () => 456;
      mockedKeyCall = boozle(setCoverUtils, 'createMemoKey', missingCacheKey, firstMemoKey, secondMemoKey);

      boozle(setCoverUtils, 'findSortedRecipeIngredientIndices', () => [10, 4, 11, 5]);
      producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
      const tyranitar: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
        pokemonSet: {
          pokemon: 'tyranitar',
          ingredients: ingredientSetToIntFlat([])
        },
        totalIngredients: ingredientSetToIntFlat([
          mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.WARMING_GINGER }),
          mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.BEAN_SAUSAGE })
        ])
      });
      const dragonite: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
        pokemonSet: {
          pokemon: 'dragonite',
          ingredients: ingredientSetToIntFlat([])
        },
        totalIngredients: ingredientSetToIntFlat([
          mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.FIERY_HERB }),
          mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.GREENGRASS_CORN })
        ])
      });
      producersByIngredientIndex[4].push(tyranitar); // sausage
      producersByIngredientIndex[5].push(tyranitar); // ginger
      producersByIngredientIndex[10].push(dragonite); // herb
      producersByIngredientIndex[11].push(dragonite); // corn

      cachedSubRecipeSolves = new Map();
      setCover = new SetCover(producersByIngredientIndex, cachedSubRecipeSolves);

      const maxTeamSize = 5;
      recipe.set(ingredientSetToIntFlat(mockedCornKeema));

      const solutions = setCover.solveRecipe(recipe, maxTeamSize);

      expect(solutions.exhaustive).toBe(true);
      expect(solutions.teams).toHaveLength(1); // one team found

      const firstTeam = solutions.teams[0];

      expect(firstTeam.members).toHaveLength(2); // team requires two members
      const teamMember1 = firstTeam.members[0];
      const teamMember2 = firstTeam.members[1];

      expect(teamMember1.pokemonSet.pokemon).toEqual('tyranitar');
      expect(teamMember1.totalIngredients[4]).toMatchInlineSnapshot(`30`);
      expect(teamMember1.totalIngredients[5]).toMatchInlineSnapshot(`30`);

      expect(teamMember2.pokemonSet.pokemon).toEqual('dragonite');
      expect(teamMember2.totalIngredients[10]).toMatchInlineSnapshot(`30`);
      expect(teamMember2.totalIngredients[11]).toMatchInlineSnapshot(`30`);

      expect(firstTeam.producedIngredients).toMatchInlineSnapshot(`
Int16Array [
  0,
  0,
  0,
  0,
  30,
  30,
  0,
  0,
  0,
  0,
  30,
  30,
  0,
  0,
  0,
  0,
  0,
]
`);
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

    it('should solve a recipe that requires multiple members', () => {
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

      recipeWithSpotsLeft[0] = 6; // recipe requires 5 apples, first index is apple
      recipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5; // 5 spots left from start

      const ingredientIndices = [0]; // only apple ingredient index
      const solutions = solve(recipeWithSpotsLeft, ingredientIndices);

      expect(solutions).toHaveLength(1); // one team found

      const firstTeam = solutions[0];

      expect(firstTeam).toHaveLength(2); // team requires two members
      const teamMember1 = firstTeam[0];
      const teamMember2 = firstTeam[1];

      expect(teamMember1.pokemonSet.pokemon).toEqual('member1');
      expect(teamMember1.totalIngredients).toEqual(
        Int16Array.from([5, ...Array(ingredient.INGREDIENTS.length - 1).fill(0)])
      );

      expect(teamMember2.pokemonSet.pokemon).toEqual('member1');
      expect(teamMember2.totalIngredients).toEqual(
        Int16Array.from([5, ...Array(ingredient.INGREDIENTS.length - 1).fill(0)])
      );
    });

    it('should solve realistic Inferno Corn Keema Curry', () => {
      producersByIngredientIndex = Array.from({ length: ingredient.TOTAL_NUMBER_OF_INGREDIENTS }, () => []);
      const tyranitar: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
        pokemonSet: {
          pokemon: 'tyranitar',
          ingredients: ingredientSetToIntFlat([])
        },
        totalIngredients: ingredientSetToIntFlat([
          mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.WARMING_GINGER }),
          mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.BEAN_SAUSAGE })
        ])
      });
      const dragonite: SetCoverPokemonSetup = mocks.setCoverPokemonSetup({
        pokemonSet: {
          pokemon: 'dragonite',
          ingredients: ingredientSetToIntFlat([])
        },
        totalIngredients: ingredientSetToIntFlat([
          mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.FIERY_HERB }),
          mocks.mockIngredientSet({ amount: 30, ingredient: ingredient.GREENGRASS_CORN })
        ])
      });
      producersByIngredientIndex[4].push(tyranitar); // sausage
      producersByIngredientIndex[5].push(tyranitar); // ginger
      producersByIngredientIndex[10].push(dragonite); // herb
      producersByIngredientIndex[11].push(dragonite); // corn

      cachedSubRecipeSolves = new Map();
      setCover = new SetCover(producersByIngredientIndex, cachedSubRecipeSolves);

      const { solve } = setCover._testAccess();

      recipeWithSpotsLeft.set(ingredientSetToIntFlat(mockedCornKeema));
      recipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5; // 5 spots in team

      const ingredientIndices = [10, 4, 11, 5];
      const solutions = solve(recipeWithSpotsLeft, ingredientIndices);

      expect(solutions).toHaveLength(1); // one team found

      const firstTeam = solutions[0];

      expect(firstTeam).toHaveLength(2); // team requires two members
      const teamMember1 = firstTeam[0];
      const teamMember2 = firstTeam[1];

      expect(teamMember1.pokemonSet.pokemon).toEqual('tyranitar');
      expect(teamMember1.totalIngredients[4]).toMatchInlineSnapshot(`30`);
      expect(teamMember1.totalIngredients[5]).toMatchInlineSnapshot(`30`);

      expect(teamMember2.pokemonSet.pokemon).toEqual('dragonite');
      expect(teamMember2.totalIngredients[10]).toMatchInlineSnapshot(`30`);
      expect(teamMember2.totalIngredients[11]).toMatchInlineSnapshot(`30`);
    });

    it('should return cached solution if available', () => {
      const { solve } = setCover._testAccess();
      const recipe: IngredientIndexToIntAmount = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
      recipe[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5; // 5 spots left

      const ingredientIndices = [0, 2, 3];
      const memoKey = setCoverUtils.createMemoKey(recipe);
      const cachedSolutions: RecipeSolutions = [
        [mocks.setCoverPokemonSetup({ pokemonSet: { pokemon: 'Cached member', ingredients: new Int16Array() } })]
      ];

      cachedSubRecipeSolves.set(memoKey, cachedSolutions);

      const result = solve(recipe, ingredientIndices);
      expect(result).toEqual(cachedSolutions);
    });

    it('should stop searching if no spots left in team', () => {
      const { solve } = setCover._testAccess();
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

      recipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 0; // team is full
      recipeWithSpotsLeft[0] = 5; // recipe requires 5 apples, first index is apple
      const ingredientIndices = [0]; // only apple ingredient index
      producersByIngredientIndex[0].push(appleProducer); // producer can solve the recipe alone

      const result = solve(recipeWithSpotsLeft, ingredientIndices);

      expect(result).toEqual([]);
    });
  });

  describe('findTeams', () => {
    it('should find teams correctly', () => {
      const { findTeams } = setCover._testAccess();

      const remainingRecipeWithSpotsLeft = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
      remainingRecipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 3; // 3 spots left
      const subRecipesAfterProducerSubtract: SubRecipeMeta[] = [
        {
          remainingRecipeWithSpotsLeft,
          remainingIngredientIndices: [1, 2, 3],
          sumRemainingRecipeIngredients: 5,
          member: mocks.setCoverPokemonSetup()
        }
      ];
      const result = findTeams(subRecipesAfterProducerSubtract);
      expect(result).toBeDefined();
    });

    it('should handle case where producer solves remaining ingredients alone', () => {
      const { findTeams } = setCover._testAccess();

      const remainingRecipeWithSpotsLeft = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
      remainingRecipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 3; // 3 spots left
      const subRecipesAfterProducerSubtract: SubRecipeMeta[] = [
        {
          remainingRecipeWithSpotsLeft: new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1),
          remainingIngredientIndices: [1, 2, 3],
          sumRemainingRecipeIngredients: 0,
          member: mocks.setCoverPokemonSetup()
        }
      ];
      const result = findTeams(subRecipesAfterProducerSubtract);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle case where no teams could solve the sub-recipe', () => {
      const { findTeams } = setCover._testAccess();
      const remainingRecipeWithSpotsLeft = new Int16Array(ingredient.TOTAL_NUMBER_OF_INGREDIENTS + 1);
      remainingRecipeWithSpotsLeft[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 0; // no spots left
      const subRecipesAfterProducerSubtract: SubRecipeMeta[] = [
        {
          remainingRecipeWithSpotsLeft,
          remainingIngredientIndices: [1, 2, 3],
          sumRemainingRecipeIngredients: 5,
          member: mocks.setCoverPokemonSetup()
        }
      ];
      const result = findTeams(subRecipesAfterProducerSubtract);
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

      const mock = boozle(setCoverUtils, 'ifUnsolvableNode', () => false);

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

      const mock = boozle(setCoverUtils, 'ifUnsolvableNode', () => true);

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
