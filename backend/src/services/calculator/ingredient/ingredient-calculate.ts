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

import { OptimalTeamSolution, SurplusIngredients } from '@src/domain/combination/combination';
import {
  IngredientSet,
  MAX_RECIPE_LEVEL,
  PokemonIngredientSet,
  Recipe,
  nature,
  pokemon,
  subskill,
  utils,
} from 'sleepapi-common';
import { extractIngredientSubskills } from '../stats/stats-calculator';

/**
 * Combines same ingredients in drop, for example [2 honey, 4 honey, 5 milk] becomes [6 honey, 5 milk]
 * @param ingredients
 * @returns
 */
export function combineSameIngredientsInDrop(ingredients: IngredientSet[]): IngredientSet[] {
  const combined = new Map<string, IngredientSet>();

  for (const drop of ingredients) {
    const { name } = drop.ingredient;
    const existingDrop = combined.get(name);

    if (existingDrop) {
      existingDrop.amount += drop.amount;
    } else {
      combined.set(name, { ...drop });
    }
  }

  return Array.from(combined.values());
}

/**
 * Calculates percentage covered of given meal by given ingredient list
 * @param meal
 * @param combination
 * @returns
 */
export function calculatePercentageCoveredByCombination(
  meal: Recipe,
  combination: { amount: number; ingredient: { name: string; value?: number } }[]
): number {
  let totalCovered = 0;

  const remainingQuantity: Map<string, number> = new Map<string, number>();
  for (const { amount, ingredient } of meal.ingredients) {
    remainingQuantity.set(ingredient.name, amount);
  }

  for (const { amount, ingredient } of combination) {
    if (remainingQuantity.has(ingredient.name)) {
      const remaining = remainingQuantity.get(ingredient.name) ?? 0;
      if (amount <= remaining) {
        totalCovered += amount;
        remainingQuantity.set(ingredient.name, remaining - amount);
      } else {
        totalCovered += remaining;
        remainingQuantity.set(ingredient.name, 0);
      }
    }
  }

  return (totalCovered / meal.ingredients.reduce((sum, { amount }) => sum + amount, 0)) * 100;
}

/**
 * subtracts producedIngredients amounts from requiredIngredients
 */
export function calculateRemainingIngredients(
  requiredIngredients: IngredientSet[],
  producedIngredients: IngredientSet[]
): IngredientSet[] {
  const result: IngredientSet[] = [];
  for (const req of requiredIngredients) {
    let amountNeeded = req.amount;
    for (const prod of producedIngredients) {
      if (prod.ingredient.name === req.ingredient.name) {
        amountNeeded -= prod.amount;
        break;
      }
    }

    if (amountNeeded > 0) {
      result.push({ ingredient: req.ingredient, amount: amountNeeded });
    }
  }

  return result;
}

export function addIngredientSet(target: IngredientSet[], toAdd: IngredientSet[]): IngredientSet[] {
  const result: IngredientSet[] = target.map((ingredientSet) => ({
    ingredient: ingredientSet.ingredient,
    amount: ingredientSet.amount,
  }));

  for (const { amount, ingredient: addedIngredient } of toAdd) {
    const existingIngredient = result.find(({ ingredient }) => ingredient.name === addedIngredient.name);

    if (existingIngredient) {
      existingIngredient.amount += amount;
    } else {
      result.push({ ingredient: addedIngredient, amount });
    }
  }

  return result;
}

export function extractRelevantSurplus(recipe: IngredientSet[], surplus: IngredientSet[]): SurplusIngredients {
  const recipeIngredientNames = new Set(recipe.map((ingredientDrop) => ingredientDrop.ingredient.name));

  const relevant = surplus.filter((ingredientDrop) => recipeIngredientNames.has(ingredientDrop.ingredient.name));
  const extra = surplus.filter((ingredientDrop) => !recipeIngredientNames.has(ingredientDrop.ingredient.name));

  return {
    total: surplus,
    relevant,
    extra,
  };
}

export function sortByMinimumFiller(
  optimalTeamSolutions: OptimalTeamSolution[],
  recipe: IngredientSet[]
): OptimalTeamSolution[] {
  return [...optimalTeamSolutions].sort((a, b) => {
    const aSurplusList = getSurplusList(a.surplus.relevant, recipe);
    const bSurplusList = getSurplusList(b.surplus.relevant, recipe);

    for (let i = 0; i < aSurplusList.length; i++) {
      if (bSurplusList[i] !== aSurplusList[i]) {
        return bSurplusList[i] - aSurplusList[i];
      }
    }

    return 0;
  });
}

export function getSurplusList(surplus: IngredientSet[], requiredIngredients: IngredientSet[]): number[] {
  return requiredIngredients
    .map((reqIngredient) => {
      const foundSurplus = surplus.find((surplusItem) => surplusItem.ingredient.name === reqIngredient.ingredient.name);
      return foundSurplus ? foundSurplus.amount : 0;
    })
    .sort((a, b) => a - b);
}

export function getAllIngredientCombinationsForLevel(pokemon: pokemon.Pokemon, level: number): IngredientSet[][] {
  const result: Array<Array<IngredientSet>> = [];

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

/**
 * Very specific. Combines two similar ingredient sets, with same ingredients at same indices
 */
export function combineIngredientDrops(array1: IngredientSet[], array2: IngredientSet[]): IngredientSet[] {
  return array1.reduce((acc: IngredientSet[], curr: IngredientSet, index: number) => {
    const other: IngredientSet = array2[index];
    if (curr.ingredient.name === other.ingredient.name) {
      acc.push({
        amount: curr.amount + other.amount,
        ingredient: curr.ingredient,
      });
    } else {
      acc.push(curr, other);
    }
    return acc;
  }, []);
}

export function calculateAveragePokemonIngredientSet(pokemonCombination: PokemonIngredientSet): PokemonIngredientSet {
  return {
    pokemon: pokemonCombination.pokemon,
    ingredientList: pokemonCombination.ingredientList.map(({ ingredient, amount }) => ({
      ingredient,
      amount: amount / pokemonCombination.ingredientList.length,
    })),
  };
}

export function sumOfIngredients(ingredients: IngredientSet[]) {
  return ingredients.map((ing) => ing.amount).reduce((sum, amount) => sum + amount, 0);
}

export function calculateContributedIngredientsValue(
  meal: Recipe,
  producedIngredients: IngredientSet[]
): { contributedValue: number; fillerValue: number } {
  const recipeIngredients: Map<string, number> = new Map<string, number>();
  for (const { amount, ingredient } of meal.ingredients) {
    recipeIngredients.set(ingredient.name, amount);
  }

  let contributedValue = 0;
  let fillerValue = 0;
  for (const { amount, ingredient } of producedIngredients) {
    if (recipeIngredients.has(ingredient.name)) {
      const recipeAmount = recipeIngredients.get(ingredient.name) ?? 0;

      if (amount <= recipeAmount) {
        contributedValue += amount * ingredient.value;
      } else {
        contributedValue += recipeAmount * ingredient.value;
        fillerValue += (amount - recipeAmount) * ingredient.taxedValue;
      }
    } else {
      // produced ingredient is not in recipe
      fillerValue += amount * ingredient.taxedValue;
    }
  }

  const recipeBonus = 1 + meal.bonus / 100;
  const maxLevelRecipeMultiplier = utils.recipeLevelBonus[MAX_RECIPE_LEVEL];

  return {
    contributedValue: contributedValue * recipeBonus * maxLevelRecipeMultiplier,
    fillerValue,
  };
}

export function calculateIngredientPercentage(params: {
  pokemon: pokemon.Pokemon;
  nature: nature.Nature;
  subskills: subskill.SubSkill[];
}) {
  const { pokemon, nature, subskills } = params;
  const ingredientSubskills = extractIngredientSubskills(subskills);
  const ingredientPercentage = (pokemon.ingredientPercentage / 100) * nature.ingredient * ingredientSubskills;
  return ingredientPercentage;
}
