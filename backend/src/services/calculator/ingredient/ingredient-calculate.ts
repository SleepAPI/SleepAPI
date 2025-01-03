/**
 * Copyright 2023 Sleep API Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import { OptimalTeamSolution } from '@src/domain/combination/combination';
// import { getSurplusList } from '@src/utils/set-cover-utils/set-cover-utils';
import type { IngredientIndexToFloatAmount, IngredientIndexToIntAmount, IngredientSet, Pokemon } from 'sleepapi-common';

// TODO: move to set-cover utils?
// export function sortByMinimumFiller(
//   optimalTeamSolutions: OptimalTeamSolution[],
//   recipe: IngredientSetSimple[]
// ): OptimalTeamSolution[] {
//   return [...optimalTeamSolutions].sort((a, b) => {
//     const aSurplusList = getSurplusList(a.surplus.relevant, recipe);
//     const bSurplusList = getSurplusList(b.surplus.relevant, recipe);

//     for (let i = 0; i < aSurplusList.length; i++) {
//       if (bSurplusList[i] !== aSurplusList[i]) {
//         return bSurplusList[i] - aSurplusList[i];
//       }
//     }

//     return 0;
//   });
// }

export function getAllIngredientLists(pokemon: Pokemon, level: number): IngredientSet[][] {
  const result: IngredientSet[][] = [];

  const ing0 = pokemon.ingredient0;
  if (level < 30) {
    result.push([ing0]);
  } else {
    for (const ing30 of pokemon.ingredient30) {
      if (level < 60) {
        result.push([ing0, ing30]);
      } else {
        for (const ing60 of pokemon.ingredient60) {
          result.push([ing0, ing30, ing60]);
        }
      }
    }
  }

  return result;
}

export function calculateAveragePokemonIngredientSet(
  ingredients: IngredientIndexToIntAmount,
  level: number
): IngredientIndexToFloatAmount {
  const ingredientsUnlocked = Math.min(Math.floor(level / 30) + 1, 3);
  const multiplier = 1 / ingredientsUnlocked;
  const dividedIngredients = Float32Array.from(ingredients, (value) => value * multiplier);
  return dividedIngredients;
}

// export function calculateContributedIngredientsValue(
//   meal: Recipe,
//   producedIngredients: IngredientSetSimple[]
// ): { contributedValue: number; fillerValue: number } {
//   const recipeIngredients: Map<string, number> = new Map<string, number>();
//   for (const { amount, ingredient } of meal.ingredients) {
//     recipeIngredients.set(ingredient.name, amount);
//   }

//   let contributedValue = 0;
//   let fillerValue = 0;
//   for (const { amount, ingredient } of producedIngredients) {
//     const ingredientData = getIngredient(ingredient);

//     if (recipeIngredients.has(ingredient)) {
//       const recipeAmount = recipeIngredients.get(ingredient) ?? 0;

//       if (amount <= recipeAmount) {
//         contributedValue += amount * ingredientData.value;
//       } else {
//         contributedValue += recipeAmount * ingredientData.value;
//         fillerValue += (amount - recipeAmount) * ingredientData.taxedValue;
//       }
//     } else {
//       // produced ingredient is not in recipe
//       fillerValue += amount * ingredientData.taxedValue;
//     }
//   }

//   const recipeBonus = 1 + meal.bonus / 100;
//   const maxLevelRecipeMultiplier = recipeLevelBonus[MAX_RECIPE_LEVEL];

//   return {
//     contributedValue: contributedValue * recipeBonus * maxLevelRecipeMultiplier,
//     fillerValue,
//   };
// }
