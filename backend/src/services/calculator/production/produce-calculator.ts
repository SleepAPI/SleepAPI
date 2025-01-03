/**
 * Copyright 2024 Sleep API Authors
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

import type { Produce, ProduceFlat } from 'sleepapi-common';
import { multiplyProduce } from 'sleepapi-common';

// FIXME: remove
export function calculateAverageProduce(params: {
  ingredients: Float32Array;
  berries: Float32Array;
  ingredientPercentage: number;
  berriesPerDrop: number;
}): ProduceFlat {
  const { ingredients, berries, ingredientPercentage, berriesPerDrop } = params;
  return {
    berries: Float32Array.from(berries, (value) => value * (berriesPerDrop * (1 - ingredientPercentage))),
    ingredients: Float32Array.from(ingredients, (value) => value * ingredientPercentage)
  };
}

export function clampHelp(params: { inventorySpace: number; averageProduce: Produce; amount: number }) {
  const { inventorySpace, averageProduce, amount } = params;

  const spillFactor = Math.min(1, inventorySpace / amount);
  const clampedProduce: Produce = multiplyProduce(averageProduce, spillFactor);
  return clampedProduce;
}
