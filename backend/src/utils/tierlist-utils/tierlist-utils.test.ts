import { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom';
import { ingredient } from 'sleepapi-common';
import { MOCKED_POKEMON, MOCKED_POKEMON_WITH_PRODUCE } from '../test-utils/defaults';
import { createDefaultProduceMap } from './tierlist-utils';

describe('createDefaultProduceMap', () => {
  it('shall create map with hashed pokemonIngredientSet keys', () => {
    const produce: CustomPokemonCombinationWithProduce[] = [
      MOCKED_POKEMON_WITH_PRODUCE,
      {
        ...MOCKED_POKEMON_WITH_PRODUCE,
        pokemonCombination: {
          ingredientList: [
            {
              amount: 1,
              ingredient: ingredient.GREENGRASS_CORN,
            },
          ],
          pokemon: MOCKED_POKEMON,
        },
      },
    ];
    const result = createDefaultProduceMap(produce);
    expect(result.size).toBe(2);
    expect(Array.from(result.keys())).toEqual(['PINSIR:Honey,Apple', 'MOCK_POKEMON:Corn']);
  });
});
