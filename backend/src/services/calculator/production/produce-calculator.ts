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

import { Produce } from '@src/domain/combination/produce';
import { PokemonIngredientSet } from 'sleepapi-common';

export function calculateAverageProduce(
  averagePokemonCombination: PokemonIngredientSet,
  ingredientPercentage: number,
  berriesPerDrop: number
): Produce {
  const result = {
    berries: {
      amount: berriesPerDrop * (1 - ingredientPercentage),
      berry: averagePokemonCombination.pokemon.berry,
    },
    ingredients: averagePokemonCombination.ingredientList.map(({ amount, ingredient }) => ({
      amount: amount * ingredientPercentage,
      ingredient: ingredient,
    })),
  };
  return result;
}

export function clampHelp(params: { inventorySpace: number; averageProduce: Produce; amount: number }) {
  const { inventorySpace, averageProduce, amount } = params;

  const spillFactor = Math.min(1, inventorySpace / amount);
  const clampedProduce: Produce = {
    berries: averageProduce.berries && {
      amount: averageProduce.berries.amount * spillFactor,
      berry: averageProduce.berries.berry,
    },
    ingredients: averageProduce.ingredients.map(({ amount, ingredient }) => ({
      amount: amount * spillFactor,
      ingredient,
    })),
  };
  return clampedProduce;
}
