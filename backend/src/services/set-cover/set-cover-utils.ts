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

import { CustomPokemonCombinationWithProduce } from '../../domain/combination/custom';

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

export const memo: Map<string, CustomPokemonCombinationWithProduce[][]> = new Map();
