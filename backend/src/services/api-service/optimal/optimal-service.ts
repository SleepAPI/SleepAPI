// import { SetCoverPokemonStats } from '@src/domain/computed/production';
// import {
//   calculateOptimalProductionForSetCover,
//   calculateSetCover,
// } from '@src/services/calculator/set-cover/calculate-set-cover';
// import { getMeal } from '@src/utils/meal-utils/meal-utils';
// import { createPokemonByIngredientReverseIndex } from '@src/utils/set-cover-utils/set-cover-utils';
// import { getIngredient } from 'sleepapi-common';

// export const FLEXIBLE_BEST_RECIPE_PER_TYPE_MULTIPLIER = 1.2;
// const TEAMFINDER_SET_COVER_TIMEOUT = 10000;

// /**
//  * Runs the optimal set algorithm for a specific recipe
//  *
//  * API: /api/optimal/meal
//  */

// export function findOptimalSetsForMeal(mealName: string, input: SetCoverPokemonStats) {
//   const meal = getMeal(mealName);

//   // TODO: this is still pretty much all the time, can we optimize the calc with caching or something?
//   // TODO: this is somehow super slow compared to classic calc
//   const pokemonProduction = calculateOptimalProductionForSetCover(input);

//   const reverseIndex = createPokemonByIngredientReverseIndex(pokemonProduction);

//   const optimalCombinations = calculateSetCover({
//     recipe: meal.ingredients,
//     reverseIndex,
//     cache: new Map(),
//     timeout: TEAMFINDER_SET_COVER_TIMEOUT,
//   });

//   return {
//     bonus: meal.bonus,
//     meal: meal.name,
//     recipe: meal.ingredients,
//     value: meal.value,
//     filter: input,
//     teams: optimalCombinations,
//   };
// }

// /**
//  * Finds the optimal Pokemon for a specific ingredient
//  *
//  * API: /api/optimal/ingredient
//  */
// export function findOptimalMonsForIngredient(ingredientName: string, input: SetCoverPokemonStats) {
//   const ingredient = getIngredient(ingredientName);
//   const ingAsRecipe = [{ ingredient: ingredient, amount: 0.001 }];
//   const pokemonProduction = calculateOptimalProductionForSetCover(input);
//   const reverseIndex = createPokemonByIngredientReverseIndex(pokemonProduction);

//   const optimalCombinations = calculateSetCover({
//     recipe: ingAsRecipe,
//     cache: new Map(),
//     reverseIndex,
//     maxTeamSize: 1,
//     timeout: TEAMFINDER_SET_COVER_TIMEOUT,
//   });

//   return {
//     ingredient: ingredient.name,
//     filter: input,
//     teams: optimalCombinations,
//   };
// }
