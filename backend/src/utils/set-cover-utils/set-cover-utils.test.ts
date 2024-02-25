import { CustomPokemonCombinationWithProduce } from '@src/domain/combination/custom';
import { SimplifiedIngredientSet } from '@src/services/set-cover/set-cover';
import { berry, ingredient, nature, pokemon } from 'sleepapi-common';
import {
  calculateRemainingSimplifiedIngredients,
  createMemoKey,
  createPokemonByIngredientReverseIndex,
  parseMemoKey,
  sumOfSimplifiedIngredients,
} from './set-cover-utils';

describe('createPokemonByIngredientReverseIndex', () => {
  it('should correctly map ingredients to Pokémon', () => {
    const pokemons: CustomPokemonCombinationWithProduce[] = [
      {
        pokemonCombination: {
          pokemon: pokemon.PINSIR,
          ingredientList: [
            { amount: 2, ingredient: ingredient.HONEY },
            { amount: 5, ingredient: ingredient.FANCY_APPLE },
          ],
        },
        detailedProduce: {
          produce: {
            berries: {
              amount: 0,
              berry: berry.LUM,
            },
            ingredients: [
              { amount: 2, ingredient: ingredient.HONEY },
              { amount: 5, ingredient: ingredient.FANCY_APPLE },
            ],
          },
          spilledIngredients: [],
          sneakySnack: {
            amount: 0,
            berry: berry.LUM,
          },
          dayHelps: 0,
          nightHelps: 0,
          averageTotalSkillProcs: 0,
        },
        customStats: { level: 30, nature: nature.RASH, subskills: [], skillLevel: 6 },
      },
      {
        pokemonCombination: {
          pokemon: pokemon.DRATINI,
          ingredientList: [
            { amount: 2, ingredient: ingredient.FIERY_HERB },
            { amount: 4, ingredient: ingredient.GREENGRASS_CORN },
          ],
        },
        detailedProduce: {
          produce: {
            berries: {
              amount: 0,
              berry: berry.YACHE,
            },
            ingredients: [
              { amount: 2, ingredient: ingredient.FIERY_HERB },
              { amount: 4, ingredient: ingredient.GREENGRASS_CORN },
            ],
          },
          spilledIngredients: [],
          sneakySnack: {
            amount: 0,
            berry: berry.YACHE,
          },
          dayHelps: 0,
          nightHelps: 0,
          averageTotalSkillProcs: 0,
        },
        customStats: {
          level: 30,
          nature: nature.RASH,
          subskills: [],
          skillLevel: 6,
        },
      },
    ];

    const reverseIndex = createPokemonByIngredientReverseIndex(pokemons);
    expect(reverseIndex.get(ingredient.HONEY.name)).toEqual([pokemons[0]]);
    expect(reverseIndex.get(ingredient.FANCY_APPLE.name)).toEqual([pokemons[0]]);
    expect(reverseIndex.get(ingredient.FIERY_HERB.name)).toEqual([pokemons[1]]);
    expect(reverseIndex.get(ingredient.GREENGRASS_CORN.name)).toEqual([pokemons[1]]);
  });

  it('should handle multiple Pokémon producing the same ingredient', () => {
    const pokemons: CustomPokemonCombinationWithProduce[] = [
      {
        pokemonCombination: {
          pokemon: pokemon.PINSIR,
          ingredientList: [{ amount: 3, ingredient: ingredient.FANCY_APPLE }],
        },
        detailedProduce: {
          produce: {
            berries: { amount: 1, berry: berry.LUM },
            ingredients: [{ amount: 3, ingredient: ingredient.FANCY_APPLE }],
          },
          spilledIngredients: [],
          sneakySnack: { amount: 1, berry: berry.LUM },
          dayHelps: 0,
          nightHelps: 0,
          averageTotalSkillProcs: 0,
        },
        customStats: { level: 30, nature: nature.RASH, subskills: [], skillLevel: 6 },
      },
      {
        pokemonCombination: {
          pokemon: pokemon.DELIBIRD,
          ingredientList: [{ amount: 4, ingredient: ingredient.FANCY_APPLE }],
        },
        detailedProduce: {
          produce: {
            berries: { amount: 2, berry: berry.PAMTRE },
            ingredients: [{ amount: 4, ingredient: ingredient.FANCY_APPLE }],
          },
          spilledIngredients: [],
          sneakySnack: { amount: 2, berry: berry.PAMTRE },
          dayHelps: 0,
          nightHelps: 0,
          averageTotalSkillProcs: 0,
        },
        customStats: { level: 30, nature: nature.RASH, subskills: [], skillLevel: 6 },
      },
    ];

    const reverseIndex = createPokemonByIngredientReverseIndex(pokemons);
    expect(reverseIndex.get(ingredient.FANCY_APPLE.name)).toHaveLength(2);
    expect(reverseIndex.get(ingredient.FANCY_APPLE.name)).toContainEqual(pokemons[0]);
    expect(reverseIndex.get(ingredient.FANCY_APPLE.name)).toContainEqual(pokemons[1]);
  });

  it('should handle an empty input array', () => {
    const pokemons: CustomPokemonCombinationWithProduce[] = [];
    const reverseIndex = createPokemonByIngredientReverseIndex(pokemons);
    expect(reverseIndex.size).toBe(0);
  });

  it('should handle Pokémon producing no ingredients', () => {
    const pokemons: CustomPokemonCombinationWithProduce[] = [
      {
        pokemonCombination: {
          pokemon: pokemon.DELIBIRD,
          ingredientList: [],
        },
        detailedProduce: {
          produce: {
            berries: { amount: 2, berry: berry.PAMTRE },
            ingredients: [],
          },
          spilledIngredients: [],
          sneakySnack: { amount: 2, berry: berry.PAMTRE },
          dayHelps: 0,
          nightHelps: 0,
          averageTotalSkillProcs: 0,
        },
        customStats: {
          level: 30,
          nature: nature.RASH,
          subskills: [],
          skillLevel: 6,
        },
      },
    ];

    const reverseIndex = createPokemonByIngredientReverseIndex(pokemons);
    expect(reverseIndex.size).toBe(0);
  });
});

describe('createMemoKey', () => {
  it('correctly formats a key with a single ingredient', () => {
    const params = {
      remainingIngredients: [{ ingredient: 'Apple', amount: 2 }],
      spotsLeftInTeam: 3,
    };
    const key = createMemoKey(params);
    expect(key).toBe('Apple:2|3');
  });

  it('correctly formats a key with multiple ingredients', () => {
    const params = {
      remainingIngredients: [
        { ingredient: 'Apple', amount: 2 },
        { ingredient: 'Honey', amount: 1 },
      ],
      spotsLeftInTeam: 2,
    };
    const key = createMemoKey(params);
    expect(key).toBe('Apple:2,Honey:1|2');
  });

  it('returns only the team spots part when no ingredients are provided', () => {
    const params = {
      remainingIngredients: [],
      spotsLeftInTeam: 4,
    };
    const key = createMemoKey(params);
    expect(key).toBe('|4');
  });

  it('correctly handles variations in ingredient amounts', () => {
    const params = {
      remainingIngredients: [
        { ingredient: 'Apple', amount: 3 },
        { ingredient: 'Honey', amount: 2 },
      ],
      spotsLeftInTeam: 1,
    };
    const key = createMemoKey(params);
    expect(key).toBe('Apple:3,Honey:2|1');
  });

  it('correctly reflects different spots left in team', () => {
    const params = {
      remainingIngredients: [{ ingredient: 'Apple', amount: 1 }],
      spotsLeftInTeam: 5,
    };
    const key = createMemoKey(params);
    expect(key).toBe('Apple:1|5');
  });
});

describe('parseMemoKey', () => {
  it('correctly parses a key with a single ingredient', () => {
    const key = 'Apple:2|3';
    const parsed = parseMemoKey(key);
    expect(parsed).toEqual({
      remainingIngredients: [{ ingredient: 'Apple', amount: 2 }],
      spotsLeftInTeam: 3,
    });
  });

  it('correctly parses a key with multiple ingredients', () => {
    const key = 'Apple:2,Banana:1|2';
    const parsed = parseMemoKey(key);
    expect(parsed).toEqual({
      remainingIngredients: [
        { ingredient: 'Apple', amount: 2 },
        { ingredient: 'Banana', amount: 1 },
      ],
      spotsLeftInTeam: 2,
    });
  });

  it('handles an empty ingredients part correctly', () => {
    const key = '|4';
    const parsed = parseMemoKey(key);
    expect(parsed).toEqual({
      remainingIngredients: [],
      spotsLeftInTeam: 4,
    });
  });

  it('correctly parses floating point amounts', () => {
    const key = 'Apple:2.5,Banana:1.75|1';
    const parsed = parseMemoKey(key);
    expect(parsed).toEqual({
      remainingIngredients: [
        { ingredient: 'Apple', amount: 2.5 },
        { ingredient: 'Banana', amount: 1.75 },
      ],
      spotsLeftInTeam: 1,
    });
  });

  it('correctly parses different spots left in team', () => {
    const key = 'Apple:1|5';
    const parsed = parseMemoKey(key);
    expect(parsed).toEqual({
      remainingIngredients: [{ ingredient: 'Apple', amount: 1 }],
      spotsLeftInTeam: 5,
    });
  });
});

describe('calculateRemainingSimplifiedIngredients', () => {
  it('calculates remaining amounts without rounding', () => {
    const requiredIngredients = [
      { ingredient: 'Apple', amount: 5 },
      { ingredient: 'Corn', amount: 3 },
    ];
    const producedIngredients = [
      { ingredient: ingredient.FANCY_APPLE, amount: 2 },
      { ingredient: ingredient.GREENGRASS_CORN, amount: 2 },
    ];
    const remaining = calculateRemainingSimplifiedIngredients(requiredIngredients, producedIngredients);
    expect(remaining).toEqual([
      { ingredient: 'Apple', amount: 3 },
      { ingredient: 'Corn', amount: 1 },
    ]);
  });

  it('calculates and rounds up remaining amounts', () => {
    const requiredIngredients = [
      { ingredient: 'Apple', amount: 5 },
      { ingredient: 'Corn', amount: 4 },
    ];
    const producedIngredients = [
      { ingredient: ingredient.FANCY_APPLE, amount: 2.5 },
      { ingredient: ingredient.GREENGRASS_CORN, amount: 1.5 },
    ];
    const remaining = calculateRemainingSimplifiedIngredients(requiredIngredients, producedIngredients, true);
    expect(remaining).toEqual([
      { ingredient: 'Apple', amount: 3 },
      { ingredient: 'Corn', amount: 3 },
    ]);
  });

  it('handles ingredients not produced at all', () => {
    const requiredIngredients = [
      { ingredient: 'Apple', amount: 2 },
      { ingredient: 'Corn', amount: 4 },
    ];
    const producedIngredients = [
      { ingredient: ingredient.HONEY, amount: 5 }, // Honey is not required
    ];
    const remaining = calculateRemainingSimplifiedIngredients(requiredIngredients, producedIngredients);
    expect(remaining).toEqual(requiredIngredients);
  });

  it('handles excess production correctly', () => {
    const requiredIngredients = [{ ingredient: 'Apple', amount: 5 }];
    const producedIngredients = [{ ingredient: ingredient.FANCY_APPLE, amount: 10 }];
    const remaining = calculateRemainingSimplifiedIngredients(requiredIngredients, producedIngredients);
    expect(remaining).toEqual([]);
  });

  it('correctly handles zero remaining ingredients needed', () => {
    const requiredIngredients = [
      { ingredient: 'Apple', amount: 5 },
      { ingredient: 'Honey', amount: 2 },
    ];
    const producedIngredients = [
      { ingredient: ingredient.FANCY_APPLE, amount: 5 },
      { ingredient: ingredient.HONEY, amount: 2 },
    ];
    const remaining = calculateRemainingSimplifiedIngredients(requiredIngredients, producedIngredients);
    expect(remaining).toEqual([]);
  });
});

describe('sumOfSimplifiedIngredients', () => {
  it('sums the amounts of a list of simplified ingredients', () => {
    const ingredients = [
      { ingredient: 'Apple', amount: 5 },
      { ingredient: 'Honey', amount: 3 },
      { ingredient: 'Corn', amount: 2 },
    ];
    const total = sumOfSimplifiedIngredients(ingredients);
    expect(total).toEqual(10); // 5 + 3 + 2 = 10
  });

  it('returns 0 for an empty list', () => {
    const ingredients: SimplifiedIngredientSet[] = [];
    const total = sumOfSimplifiedIngredients(ingredients);
    expect(total).toEqual(0);
  });

  it('handles single ingredient correctly', () => {
    const ingredients = [{ ingredient: 'Honey', amount: 4 }];
    const total = sumOfSimplifiedIngredients(ingredients);
    expect(total).toEqual(4);
  });

  it('handles fractional amounts correctly', () => {
    const ingredients = [
      { ingredient: 'Apple', amount: 1.5 },
      { ingredient: 'Honey', amount: 2.25 },
    ];
    const total = sumOfSimplifiedIngredients(ingredients);
    expect(total).toBeCloseTo(3.75); // To handle floating point precision issues
  });

  it('handles negative amounts, implying a deficit', () => {
    const ingredients = [
      { ingredient: 'Apple', amount: 5 },
      { ingredient: 'Corn', amount: -2 }, // Assuming negative values can represent a deficit
    ];
    const total = sumOfSimplifiedIngredients(ingredients);
    expect(total).toEqual(3); // 5 + (-2) = 3
  });
});
