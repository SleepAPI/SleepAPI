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

import { IngredientSet } from 'sleepapi-common';
import { CustomPokemonCombinationWithProduce } from '../../domain/combination/custom';
import { MemoizedParameters, SimplifiedIngredientSet } from '../../services/set-cover/set-cover';

export function createPokemonByIngredientReverseIndex(pokemons: CustomPokemonCombinationWithProduce[]) {
  const reverseIndex: Map<string, CustomPokemonCombinationWithProduce[]> = new Map();

  // Populate the reverse index map by iterating over the pokemons array
  for (const pokemon of pokemons) {
    for (const ingredient of pokemon.detailedProduce.produce.ingredients) {
      if (!reverseIndex.has(ingredient.ingredient.name)) {
        reverseIndex.set(ingredient.ingredient.name, [pokemon]);
      } else {
        const array = reverseIndex.get(ingredient.ingredient.name);
        if (array !== undefined) {
          array.push(pokemon);
        }
      }
    }
  }

  return reverseIndex;
}

export function createMemoKey(params: MemoizedParameters): string {
  const ingredientsPart = params.remainingIngredients.map((ing) => `${ing.ingredient}:${ing.amount}`).join(',');
  return `${ingredientsPart}|${params.spotsLeftInTeam}`;
}

export function parseMemoKey(key: string): MemoizedParameters {
  const [ingredientsPart, spotsLeftInTeamStr] = key.split('|');
  let remainingIngredients: SimplifiedIngredientSet[] = [];

  // Only proceed to parse ingredientsPart if it is not empty
  if (ingredientsPart) {
    remainingIngredients = ingredientsPart.split(',').map((part) => {
      const [ingredient, amountStr] = part.split(':');
      return { ingredient, amount: parseFloat(amountStr) };
    });
  }

  return {
    remainingIngredients,
    spotsLeftInTeam: parseInt(spotsLeftInTeamStr, 10),
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
