import { ingredient, pokemon } from 'sleepapi-common';
import { TieredPokemonCombinationContribution } from '../../../routes/tierlist-router/tierlist-router';
import {
  calculateDiffForEntry,
  createPreviousIndexMap,
  diffTierlistRankings,
} from '../../../utils/tierlist-utils/tierlist-utils';

describe('diffTierlistRankings', () => {
  it('shall return current unchanged if previous is undefined', () => {
    const current: TieredPokemonCombinationContribution[] = [
      {
        diff: 0,
        tier: 'S',
        pokemonCombinationContribution: {
          combinedContribution: {
            averagePercentage: 100,
            contributions: [],
            score: 100,
          },
          pokemonCombination: {
            ingredientList: [],
            pokemon: pokemon.PINSIR,
          },
        },
      },
    ];
    const result = diffTierlistRankings(current);
    expect(result).toEqual(current);
  });

  it('shall return correct diff if previous array is bigger', () => {
    const current: TieredPokemonCombinationContribution[] = [
      {
        diff: 0,
        tier: 'S',
        pokemonCombinationContribution: {
          combinedContribution: {
            averagePercentage: 100,
            contributions: [],
            score: 100,
          },
          pokemonCombination: {
            ingredientList: [],
            pokemon: pokemon.PINSIR,
          },
        },
      },
    ];
    const previous: TieredPokemonCombinationContribution[] = [
      {
        diff: 0,
        tier: 'A',
        pokemonCombinationContribution: {
          combinedContribution: {
            averagePercentage: 100,
            contributions: [],
            score: 100,
          },
          pokemonCombination: {
            ingredientList: [],
            pokemon: pokemon.BLASTOISE,
          },
        },
      },
      {
        diff: 0,
        tier: 'A',
        pokemonCombinationContribution: {
          combinedContribution: {
            averagePercentage: 100,
            contributions: [],
            score: 100,
          },
          pokemonCombination: {
            ingredientList: [],
            pokemon: pokemon.PINSIR,
          },
        },
      },
    ];

    const result = diffTierlistRankings(current, previous);
    expect(result).toHaveLength(1);
    expect(result[0].diff).toBe(1);
  });

  it('shall lower diff of old mons if new mon is added with higher rank', () => {
    const current: TieredPokemonCombinationContribution[] = [
      {
        diff: 0,
        tier: 'S',
        pokemonCombinationContribution: {
          combinedContribution: {
            averagePercentage: 100,
            contributions: [],
            score: 100,
          },
          pokemonCombination: {
            ingredientList: [],
            pokemon: pokemon.BLASTOISE,
          },
        },
      },
      {
        diff: 0,
        tier: 'S',
        pokemonCombinationContribution: {
          combinedContribution: {
            averagePercentage: 100,
            contributions: [],
            score: 100,
          },
          pokemonCombination: {
            ingredientList: [],
            pokemon: pokemon.PINSIR,
          },
        },
      },
    ];
    const previous: TieredPokemonCombinationContribution[] = [
      {
        diff: 0,
        tier: 'A',
        pokemonCombinationContribution: {
          combinedContribution: {
            averagePercentage: 100,
            contributions: [],
            score: 100,
          },
          pokemonCombination: {
            ingredientList: [],
            pokemon: pokemon.PINSIR,
          },
        },
      },
    ];

    const result = diffTierlistRankings(current, previous);
    expect(result).toHaveLength(2);
    expect(
      result.some(
        (item) => item.pokemonCombinationContribution.pokemonCombination.pokemon === pokemon.PINSIR && item.diff === -1
      )
    ).toBeTruthy();
  });

  it('shall, for new mons, set diff to undefined if not found in previous', () => {
    const current: TieredPokemonCombinationContribution[] = [
      {
        diff: 0,
        tier: 'S',
        pokemonCombinationContribution: {
          combinedContribution: {
            averagePercentage: 100,
            contributions: [],
            score: 100,
          },
          pokemonCombination: {
            ingredientList: [],
            pokemon: pokemon.PINSIR,
          },
        },
      },
    ];
    const previous: TieredPokemonCombinationContribution[] = [];

    const result = diffTierlistRankings(current, previous);
    expect(result).toHaveLength(1);
    expect(result[0].diff).toBeUndefined;
  });
});

describe('createPreviousIndexMap', () => {
  it('should create a map of pokemon hashes to their indexes', () => {
    const previous: TieredPokemonCombinationContribution[] = [
      {
        pokemonCombinationContribution: {
          pokemonCombination: {
            pokemon: pokemon.BLASTOISE,
            ingredientList: [{ amount: 2, ingredient: ingredient.MOOMOO_MILK }],
          },
          combinedContribution: {
            averagePercentage: 100,
            contributions: [],
            score: 100,
          },
        },
        diff: 0,
        tier: 'S',
      },
      {
        pokemonCombinationContribution: {
          pokemonCombination: {
            pokemon: pokemon.PINSIR,
            ingredientList: [{ amount: 2, ingredient: ingredient.HONEY }],
          },
          combinedContribution: {
            averagePercentage: 100,
            contributions: [],
            score: 100,
          },
        },
        diff: 0,
        tier: 'S',
      },
    ];

    expect(createPreviousIndexMap(previous)).toMatchInlineSnapshot(`
      Map {
        "BLASTOISE:Milk" => 0,
        "PINSIR:Honey" => 1,
      }
    `);
  });
});

describe('calculateDiffForEntry', () => {
  it('should calculate correct diff when pokemon is found in previous', () => {
    const currentEntry: TieredPokemonCombinationContribution = {
      pokemonCombinationContribution: {
        pokemonCombination: {
          pokemon: pokemon.BLASTOISE,
          ingredientList: [{ amount: 2, ingredient: ingredient.MOOMOO_MILK }],
        },
        combinedContribution: {
          averagePercentage: 100,
          contributions: [],
          score: 100,
        },
      },
      diff: 0,
      tier: 'S',
    };
    const currentIndex = 2;
    const previousIndexMap = new Map<string, number>([['BLASTOISE:Milk', 0]]);

    const expectedDiff = 0 - 2;

    const result = calculateDiffForEntry(currentEntry, currentIndex, previousIndexMap);

    expect(result.diff).toBe(expectedDiff);
  });

  it('shall, for new mons, set diff to undefined when pokemon is not found in previous', () => {
    const currentEntry: TieredPokemonCombinationContribution = {
      pokemonCombinationContribution: {
        pokemonCombination: {
          pokemon: pokemon.BLASTOISE,
          ingredientList: [{ amount: 2, ingredient: ingredient.MOOMOO_MILK }],
        },
        combinedContribution: {
          averagePercentage: 100,
          contributions: [],
          score: 100,
        },
      },
      diff: 0,
      tier: 'S',
    };
    const currentIndex = 1;
    const previousIndexMap = new Map<string, number>();

    const result = calculateDiffForEntry(currentEntry, currentIndex, previousIndexMap);

    expect(result.diff).toBeUndefined;
  });
});
