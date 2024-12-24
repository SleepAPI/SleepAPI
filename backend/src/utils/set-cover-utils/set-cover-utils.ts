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

import { addIngredientSet } from '@src/services/calculator/ingredient/ingredient-calculate';
import { calculateHelperBoostHelpsFromUnique } from '@src/services/calculator/skill/skill-calculator';
import type { IngredientSet, berry } from 'sleepapi-common';
import { ingredient, mainskill } from 'sleepapi-common';
import type { CustomPokemonCombinationWithProduce } from '../../domain/combination/custom';
import type {
  HelperBoostStatus,
  MemoizedParameters,
  SimplifiedIngredientSet
} from '../../services/set-cover/set-cover';

export function createPokemonByIngredientReverseIndex(pokemons: CustomPokemonCombinationWithProduce[]) {
  const reverseIndex: Map<string, CustomPokemonCombinationWithProduce[]> = new Map();

  const helperBoostPokemon = pokemons.filter(
    ({ pokemonCombination }) => pokemonCombination.pokemon.skill === mainskill.HELPER_BOOST
  );
  if (helperBoostPokemon.length > 0) {
    for (const ing of ingredient.INGREDIENTS) {
      reverseIndex.set(ing.name, [...helperBoostPokemon]);
    }
  }

  const remainingPokemon = pokemons.filter(
    ({ pokemonCombination }) => pokemonCombination.pokemon.skill !== mainskill.HELPER_BOOST
  );

  // Populate the reverse index map by iterating over the pokemons array
  for (const pokemon of remainingPokemon) {
    for (const { ingredient } of pokemon.detailedProduce.produce.ingredients) {
      if (!reverseIndex.has(ingredient.name)) {
        reverseIndex.set(ingredient.name, [pokemon]);
      } else {
        const array = reverseIndex.get(ingredient.name);
        if (array !== undefined) {
          array.push(pokemon);
        }
      }
    }
  }

  return reverseIndex;
}

export function createMemoKey(params: MemoizedParameters): string {
  const { remainingIngredients, spotsLeftInTeam, helperBoost } = params;

  const ingredientsPart = remainingIngredients.map((ing) => `${ing.ingredient}:${ing.amount}`).join(',');
  const helperBoostPart = `${helperBoost ? `${helperBoost.amount}:${helperBoost.berry}` : ''}`;
  return `${ingredientsPart}|${spotsLeftInTeam}|${helperBoostPart}`;
}

export function parseMemoKey(key: string): MemoizedParameters {
  const [ingredientsPart, spotsLeftInTeamStr, helperBoostPart] = key.split('|');
  let remainingIngredients: SimplifiedIngredientSet[] = [];

  // Only proceed to parse ingredientsPart if it is not empty
  if (ingredientsPart) {
    remainingIngredients = ingredientsPart.split(',').map((part) => {
      const [ingredient, amountStr] = part.split(':');
      return { ingredient, amount: parseFloat(amountStr) };
    });
  }

  // Only proceed to parse helperBoostPart if it is not empty
  let helperBoost: HelperBoostStatus | undefined = undefined;
  if (helperBoostPart) {
    const [amount, berry] = helperBoostPart.split(':');
    helperBoost = {
      amount: +amount,
      berry
    };
  }

  return {
    remainingIngredients,
    spotsLeftInTeam: parseInt(spotsLeftInTeamStr, 10),
    helperBoost
  };
}

export function calculateRemainingSimplifiedIngredients(
  requiredIngredients: SimplifiedIngredientSet[],
  producedIngredients: IngredientSet[],
  round = false
): SimplifiedIngredientSet[] {
  const result: SimplifiedIngredientSet[] = [];
  for (const req of requiredIngredients) {
    let amountNeeded = req.amount;
    for (const prod of producedIngredients) {
      if (prod.ingredient.name === req.ingredient) {
        amountNeeded -= prod.amount;
        if (round) {
          amountNeeded = Math.ceil(amountNeeded);
        }
        break;
      }
    }

    if (amountNeeded > 0) {
      result.push({ ingredient: req.ingredient, amount: amountNeeded });
    }
  }

  return result;
}

export function sumOfSimplifiedIngredients(ingredients: SimplifiedIngredientSet[]) {
  return ingredients.map((ing) => ing.amount).reduce((sum, amount) => sum + amount, 0);
}

export const memo: Map<string, CustomPokemonCombinationWithProduce[][]> = new Map();

export function countUniqueHelperBoostPokemon(team: CustomPokemonCombinationWithProduce[], boostedBerry: berry.Berry) {
  const { count } = team.reduce(
    (accumulator, cur) => {
      if (
        cur.pokemonCombination.pokemon.berry === boostedBerry &&
        !accumulator.names.has(cur.pokemonCombination.pokemon.name)
      ) {
        accumulator.names.add(cur.pokemonCombination.pokemon.name);
        accumulator.count += 1;
      }
      return accumulator;
    },
    { count: 0, names: new Set<string>() }
  );
  return count;
}

export function countNrOfHelperBoostHelps(params: {
  uniqueBoostedMons: number;
  skillProcs: number;
  skillLevel: number;
}) {
  const { uniqueBoostedMons, skillProcs, skillLevel } = params;

  return (
    skillProcs *
    (mainskill.HELPER_BOOST.amount(skillLevel) + calculateHelperBoostHelpsFromUnique(uniqueBoostedMons, skillLevel))
  );
}

/**
 * Will add one help of average produce to every team member and @param currentNrOfHelps to the newest team member (last index)
 */
export function calculateHelperBoostIngredientsIncrease(
  currentTeam: CustomPokemonCombinationWithProduce[],
  currentNrOfHelps: number
) {
  let increasedIngredients: IngredientSet[] = [];
  for (let i = 0; i < currentTeam.length; i++) {
    const member = currentTeam[i];
    const addedHelps = member === currentTeam[currentTeam.length - 1] ? currentNrOfHelps : 1;

    const ingredientsFromBoostedHelps = member.averageProduce.ingredients.map(({ amount, ingredient }) => ({
      amount: amount * addedHelps,
      ingredient
    }));
    increasedIngredients = addIngredientSet(increasedIngredients, ingredientsFromBoostedHelps);
  }
  return increasedIngredients;
}
