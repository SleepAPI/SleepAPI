import type { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom.js';
import { MOCKED_POKEMON, MOCKED_POKEMON_WITH_PRODUCE } from '@src/utils/test-utils/defaults.js';
import { createProduceMap } from '@src/utils/tierlist-utils/tierlist-utils.js';
import { describe, expect, it } from 'bun:test';
import { ingredient } from 'sleepapi-common';

describe('createProduceMap', () => {
  it('shall create map with hashed pokemonIngredientSet keys', () => {
    const produce: CustomPokemonCombinationWithProduce[] = [
      MOCKED_POKEMON_WITH_PRODUCE,
      {
        ...MOCKED_POKEMON_WITH_PRODUCE,
        pokemonCombination: {
          ingredientList: [
            {
              amount: 1,
              ingredient: ingredient.GREENGRASS_CORN
            }
          ],
          pokemon: MOCKED_POKEMON
        }
      }
    ];
    const result = createProduceMap(produce);
    expect(result.size).toBe(2);
    expect(Array.from(result.keys())).toEqual(['PINSIR:Honey,Apple', 'MOCK_POKEMON:Corn']);
  });
});
