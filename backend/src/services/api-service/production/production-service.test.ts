import { MOCKED_OPTIMAL_PRODUCTION_STATS } from '@src/utils/test-utils/defaults';
import { ingredient, pokemon } from 'sleepapi-common';
import { calculatePokemonProduction } from './production-service';

describe('calculatePokemonProduction', () => {
  it('should calculate production for PINSIR with given details', () => {
    const result = calculatePokemonProduction(
      pokemon.PINSIR.name,
      MOCKED_OPTIMAL_PRODUCTION_STATS,
      [ingredient.HONEY.name, ingredient.FANCY_APPLE.name, ingredient.BEAN_SAUSAGE.name],
      1
    );

    expect(result).toHaveProperty('filters');
    expect(result).toHaveProperty('production');
    expect(result).toHaveProperty('allIngredientSets');
    expect(result.allIngredientSets).toHaveLength(6);
    expect(result.filters).toEqual(MOCKED_OPTIMAL_PRODUCTION_STATS);

    result.allIngredientSets.forEach(({ pokemonProduction }) => {
      expect(pokemonProduction).toHaveProperty('pokemonCombination');
      expect(pokemonProduction).toHaveProperty('detailedProduce');
      expect(pokemonProduction).toHaveProperty('customStats');
    });
  });
});
