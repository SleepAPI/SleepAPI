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

import { OptimalTeamSolution, PokemonCombination } from '../../../domain/combination/combination';
import { CustomStats } from '../../../domain/combination/custom';
import { Pokemon } from '../../../domain/pokemon/pokemon';
import { Ingredient, IngredientDrop } from '../../../domain/produce/ingredient';
import { DetailedProduce } from '../../../domain/produce/produce';
import { Meal } from '../../../domain/recipe/meal';
import { getMap, setMap } from '../../../utils/map-utils/map-utils';
import { calculateNrOfBerriesPerDrop } from '../berry/berry-calculator';
import {
  calculateAverageProduce,
  calculateNightlyProduce,
  calculateProduceForSpecificTimeWindow,
} from '../production/produce-calculator';
import { extractIngredientSubskills, extractInventorySubskills } from '../stats/stats-calculator';

/**
 * Combines same ingredients in drop, for example [2 honey, 4 honey, 5 milk] becomes [6 honey, 5 milk]
 * @param ingredients
 * @returns
 */
export function combineSameIngredientsInDrop(ingredients: IngredientDrop[]): IngredientDrop[] {
  const map = new Map<Ingredient, number>();
  for (const { amount, ingredient } of ingredients) {
    const current = getMap(map, ingredient) || 0;
    setMap(map, ingredient, Number(current) + Number(amount));
  }

  const result: IngredientDrop[] = [];
  for (const [ing, num] of map.entries()) {
    result.push({
      amount: num,
      ingredient: ing,
    });
  }

  return result;
}

/**
 * Calculates percentage covered of given meal by given ingredient list
 * @param meal
 * @param combination
 * @returns
 */
export function calculatePercentageCoveredByCombination(
  meal: Meal,
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

export function calculateRemainingIngredients(
  requiredIngredients: IngredientDrop[],
  producedIngredients: IngredientDrop[]
): IngredientDrop[] {
  const remainingIngredients: IngredientDrop[] = JSON.parse(JSON.stringify(requiredIngredients));
  for (const produced of producedIngredients) {
    const index = remainingIngredients.findIndex((required) => required.ingredient.name === produced.ingredient.name);
    if (index !== -1) {
      remainingIngredients[index].amount -= produced.amount;
      if (remainingIngredients[index].amount <= 0) {
        remainingIngredients.splice(index, 1);
      }
    }
  }
  return remainingIngredients;
}

export function sortByMinimumFiller(
  optimalTeamSolutions: OptimalTeamSolution[],
  requiredIngredients: IngredientDrop[]
): OptimalTeamSolution[] {
  return [...optimalTeamSolutions].sort((a, b) => {
    const aSurplusList = getSurplusList(a.surplus, requiredIngredients);
    const bSurplusList = getSurplusList(b.surplus, requiredIngredients);

    for (let i = 0; i < aSurplusList.length; i++) {
      if (bSurplusList[i] !== aSurplusList[i]) {
        return bSurplusList[i] - aSurplusList[i];
      }
    }

    return 0;
  });
}

export function getSurplusList(surplus: IngredientDrop[], requiredIngredients: IngredientDrop[]): number[] {
  return requiredIngredients
    .map((reqIngredient) => {
      const foundSurplus = surplus.find((surplusItem) => surplusItem.ingredient.name === reqIngredient.ingredient.name);
      return foundSurplus ? foundSurplus.amount : 0;
    })
    .sort((a, b) => a - b);
}

export function calculateContributedPowerForMeal(meal: Meal, percentage: number) {
  return meal.value * (percentage / 100);
}

export function getAllIngredientCombinationsForLevel(pokemon: Pokemon, level: number): IngredientDrop[][] {
  const result: Array<Array<IngredientDrop>> = [];

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
 * Calculates average ingredients produced per meal with natural declining energy
 * Calculate average nightly produce and subtracts overflow ingredients
 */
export function calculateProducePerMealWindow(params: {
  pokemonCombination: PokemonCombination;
  customStats: CustomStats;
  goodCamp?: boolean;
  helpingBonus?: number;
  e4eProcs?: number;
  combineIngredients?: boolean;
}): DetailedProduce {
  const { pokemonCombination, customStats, goodCamp, helpingBonus, e4eProcs, combineIngredients = false } = params;

  const MEALS_IN_DAY = 3;

  const averageIngredientDrop = calculateAverageIngredientDrop(customStats.level, pokemonCombination);
  const averagedPokemonCombination: PokemonCombination = {
    pokemon: pokemonCombination.pokemon,
    ingredientList: averageIngredientDrop,
  };

  const ingredientSubskills = extractIngredientSubskills(customStats.subskills);
  const ingredientPercentage =
    (averagedPokemonCombination.pokemon.ingredientPercentage / 100) *
    customStats.nature.ingredient *
    ingredientSubskills;

  const berriesPerDrop = calculateNrOfBerriesPerDrop(averagedPokemonCombination.pokemon, customStats.subskills);

  const daytimeProduce = calculateProduceForSpecificTimeWindow({
    averagedPokemonCombination,
    ingredientPercentage,
    customStats,
    energyPeriod: 'DAY',
    timeWindow: 15.5,
    goodCamp,
    helpingBonus,
    e4eProcs,
  });

  const nighttimeProduce = calculateProduceForSpecificTimeWindow({
    averagedPokemonCombination,
    ingredientPercentage,
    customStats,
    energyPeriod: 'NIGHT',
    timeWindow: 8.5,
    goodCamp,
    helpingBonus,
    e4eProcs,
  });

  const averageProduce = calculateAverageProduce(averagedPokemonCombination, ingredientPercentage, berriesPerDrop);

  const maxCarrySize = pokemonCombination.pokemon.maxCarrySize + extractInventorySubskills(customStats.subskills);

  const detailedNightlyProduce = calculateNightlyProduce(
    maxCarrySize,
    averageProduce,
    nighttimeProduce,
    berriesPerDrop
  );

  const producedIngredients = combineIngredientDrops(
    daytimeProduce.ingredients,
    detailedNightlyProduce.produce.ingredients
  ).map(({ amount, ingredient }) => ({
    amount: amount / MEALS_IN_DAY,
    ingredient: ingredient,
  }));

  return {
    produce: {
      berries: {
        berry: daytimeProduce.berries.berry,
        amount: daytimeProduce.berries.amount + detailedNightlyProduce.produce.berries.amount,
      },
      ingredients: combineIngredients ? combineSameIngredientsInDrop(producedIngredients) : producedIngredients,
    },
    sneakySnack: detailedNightlyProduce.sneakySnack,
    spilledIngredients: combineIngredients
      ? combineSameIngredientsInDrop(detailedNightlyProduce.spilledIngredients)
      : detailedNightlyProduce.spilledIngredients,
    helpsBeforeSS: detailedNightlyProduce.helpsBeforeSS,
    helpsAfterSS: detailedNightlyProduce.helpsAfterSS,
  };
}

export function combineIngredientDrops(array1: IngredientDrop[], array2: IngredientDrop[]): IngredientDrop[] {
  return array1.reduce((acc: IngredientDrop[], curr: IngredientDrop, index: number) => {
    const other: IngredientDrop = array2[index];
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

export function calculateAverageIngredientDrop(level: number, pokemonCombination: PokemonCombination) {
  const combinationWithoutLockedIngredients =
    level >= 60 ? pokemonCombination.ingredientList : pokemonCombination.ingredientList.slice(0, 2);
  return combinationWithoutLockedIngredients.map((comb) => {
    return {
      amount: comb.amount / combinationWithoutLockedIngredients.length,
      ingredient: comb.ingredient,
    };
  });
}

export function sumOfIngredients(ingredients: IngredientDrop[]) {
  return ingredients.map((ing) => ing.amount).reduce((sum, amount) => sum + amount, 0);
}

export function calculateContributedIngredientsValue(
  meal: Meal,
  producedIngredients: IngredientDrop[]
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

  const mealBonus = 1 + meal.bonus / 100;
  const level50RecipeBonus = 2.48;

  return {
    contributedValue: contributedValue * mealBonus * level50RecipeBonus,
    fillerValue,
  };
}
