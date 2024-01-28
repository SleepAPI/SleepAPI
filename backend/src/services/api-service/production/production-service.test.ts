import { ingredient, nature, pokemon } from 'sleepapi-common';
import { calculatePokemonProduction } from './production-service';

describe('calculatePokemonProduction', () => {
  it('should calculate production for PINSIR with given details', () => {
    const details = {
      level: 60,
      nature: nature.BASHFUL.name,
      subskills: [],
      e4e: 0,
      helpingbonus: 0,
      camp: false,
    };

    const result = calculatePokemonProduction(pokemon.PINSIR.name, details);

    expect(result).toHaveProperty('filters');
    expect(result).toHaveProperty('pokemonCombinations');
    expect(result.pokemonCombinations).toHaveLength(6);
    expect(result.filters).toEqual(
      expect.objectContaining({
        level: details.level,
        nature: nature.BASHFUL,
        subskills: expect.arrayContaining(details.subskills),
        e4eProcs: details.e4e,
        helpingBonus: details.helpingbonus,
        goodCamp: details.camp,
      })
    );

    result.pokemonCombinations.forEach((combination) => {
      expect(combination).toHaveProperty('pokemonCombination');
      expect(combination).toHaveProperty('detailedProduce');
      expect(combination).toHaveProperty('customStats');
    });
  });

  it('should calculate production for PINSIR with a specific ingredient set', () => {
    const details = {
      level: 30,
      nature: nature.BASHFUL.name,
      subskills: [],
      e4e: 0,
      helpingbonus: 0,
      camp: false,
      ingredientSet: [ingredient.HONEY.name, ingredient.FANCY_APPLE.name],
    };

    const result = calculatePokemonProduction(pokemon.PINSIR.name, details);

    expect(result).toHaveProperty('filters');
    expect(result).toHaveProperty('pokemonCombinations');
    expect(result.pokemonCombinations).toHaveLength(1);
    expect(result.filters).toEqual(
      expect.objectContaining({
        level: details.level,
        nature: nature.BASHFUL,
        subskills: expect.arrayContaining(details.subskills),
        e4eProcs: details.e4e,
        helpingBonus: details.helpingbonus,
        goodCamp: details.camp,
      })
    );

    result.pokemonCombinations.forEach((combination) => {
      expect(combination).toHaveProperty('pokemonCombination');
      expect(combination).toHaveProperty('detailedProduce');
      expect(combination).toHaveProperty('customStats');
    });
  });
});
