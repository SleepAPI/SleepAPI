import { MOCKED_OPTIMAL_PRODUCTION_STATS } from '@src/utils/test-utils/defaults';
import { ingredient, pokemon } from 'sleepapi-common';
import { calculatePokemonProduction } from './production-service';

describe('calculatePokemonProduction', () => {
  it('should calculate production for PINSIR with given details', () => {
    const result = calculatePokemonProduction(
      pokemon.PINSIR,
      MOCKED_OPTIMAL_PRODUCTION_STATS,
      [ingredient.HONEY.name, ingredient.FANCY_APPLE.name, ingredient.BEAN_SAUSAGE.name],
      false,
      1
    );

    expect(result).toHaveProperty('filters');
    expect(result).toHaveProperty('production');
    expect(result).toHaveProperty('log');
    expect(result).toHaveProperty('summary');
    expect(result.neutralProduction).toBeUndefined;
    expect(result.optimalIngredientProduction).toBeUndefined;
    expect(result.optimalBerryProduction).toBeUndefined;
    expect(result.optimalSkillProduction).toBeUndefined;

    expect(result.filters).toEqual(MOCKED_OPTIMAL_PRODUCTION_STATS);
  });

  it('should calculate production for PINSIR with production analysis', () => {
    const result = calculatePokemonProduction(
      pokemon.PINSIR,
      MOCKED_OPTIMAL_PRODUCTION_STATS,
      [ingredient.HONEY.name, ingredient.FANCY_APPLE.name, ingredient.BEAN_SAUSAGE.name],
      true,
      1
    );

    expect(result).toHaveProperty('filters');
    expect(result).toHaveProperty('production');
    expect(result).toHaveProperty('log');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('neutralProduction');
    expect(result).toHaveProperty('optimalIngredientProduction');
    expect(result).toHaveProperty('optimalBerryProduction');
    expect(result).toHaveProperty('optimalSkillProduction');

    expect(result.filters).toEqual(MOCKED_OPTIMAL_PRODUCTION_STATS);
  });
});
