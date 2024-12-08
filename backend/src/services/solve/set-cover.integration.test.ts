// import { SetCover } from '@src/services/solve/set-cover.js';
// import { groupProducersByIngredientIndex } from '@src/services/solve/utils/solve-utils.js';
// import { IngredientIndexToIntAmount, ingredient } from 'sleepapi-common';

// describe('SetCover Integration Tests', () => {
//   let setCover: SetCover;
//   let producersByIngredientIndex: ReturnType<typeof groupProducersByIngredientIndex>;
//   let cachedSubRecipeSolves: Map<number, any>;

//   beforeEach(() => {
//     producersByIngredientIndex = groupProducersByIngredientIndex(); // Initialize with appropriate mock data
//     cachedSubRecipeSolves = new Map();
//     setCover = new SetCover(producersByIngredientIndex, cachedSubRecipeSolves);
//   });

//   it('should solve a recipe end-to-end', () => {
//     const recipe: IngredientIndexToIntAmount = new Int16Array(ingredient.INGREDIENTS.length);
//     recipe[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5; // Mock data
//     const maxTeamSize = 3; // Mock data

//     const result = setCover.solveRecipe(recipe, maxTeamSize);

//     expect(result).toBeDefined();
//     expect(result).toHaveProperty('solutions');
//     expect(result).toHaveProperty('startTime');
//     expect(result).toHaveProperty('timeout');
//   });

//   it('should return cached solutions if available', () => {
//     const recipe: IngredientIndexToIntAmount = new Int16Array(ingredient.INGREDIENTS.length);
//     recipe[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5; // Mock data
//     const maxTeamSize = 3; // Mock data
//     const memoKey = 123; // Mock data
//     const cachedSolutions = [[{ id: 1, name: 'MockProducer' }]]; // Mock data

//     cachedSubRecipeSolves.set(memoKey, cachedSolutions);
//     const result = setCover.solveRecipe(recipe, maxTeamSize);

//     expect(result).toBeDefined();
//     expect(result.solutions).toEqual(cachedSolutions);
//   });

//   it('should solve recipe and cache the result if no cached solutions are available', () => {
//     const recipe: IngredientIndexToIntAmount = new Int16Array(ingredient.INGREDIENTS.length);
//     recipe[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5; // Mock data
//     const maxTeamSize = 3; // Mock data
//     const memoKey = 123; // Mock data

//     const result = setCover.solveRecipe(recipe, maxTeamSize);

//     expect(result).toBeDefined();
//     expect(cachedSubRecipeSolves.has(memoKey)).toBe(true);
//   });

//   it('should format the result correctly', () => {
//     const recipe: IngredientIndexToIntAmount = new Int16Array(ingredient.INGREDIENTS.length);
//     recipe[ingredient.TOTAL_NUMBER_OF_INGREDIENTS] = 5; // Mock data
//     const maxTeamSize = 3; // Mock data

//     const result = setCover.solveRecipe(recipe, maxTeamSize);

//     expect(result).toHaveProperty('solutions');
//     expect(result).toHaveProperty('startTime');
//     expect(result).toHaveProperty('timeout');
//   });
// });
