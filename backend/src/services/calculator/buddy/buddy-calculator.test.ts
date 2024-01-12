import { FANCY_APPLE, HONEY, MOOMOO_MILK, SOOTHING_CACAO } from '../../../domain/produce/ingredient';
import { generateAllBuddyCombinations } from './buddy-calculator';

describe('generateAllBuddyCombinations', () => {
  it('shall combine all unique pairings in pokemon combination array', () => {
    const pokemonCombinations = [
      {
        id: 1,
        ingredient0: HONEY.name,
        ingredient30: HONEY.name,
        ingredient60: HONEY.name,
        produced_amount0: 2,
        produced_amount30: 5,
        produced_amount60: 8,
      },
      {
        id: 2,
        ingredient0: MOOMOO_MILK.name,
        ingredient30: MOOMOO_MILK.name,
        ingredient60: SOOTHING_CACAO.name,
        produced_amount0: 2,
        produced_amount30: 5,
        produced_amount60: 5,
      },
      {
        id: 3,
        ingredient0: SOOTHING_CACAO.name,
        ingredient30: SOOTHING_CACAO.name,
        ingredient60: FANCY_APPLE.name,
        produced_amount0: 2,
        produced_amount30: 5,
        produced_amount60: 12,
      },
    ];
    const data = generateAllBuddyCombinations(pokemonCombinations);
    expect(data.length).toBe(6);
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "buddy1": {
            "id": 1,
            "ingredient0": "Honey",
            "ingredient30": "Honey",
            "ingredient60": "Honey",
            "produced_amount0": 2,
            "produced_amount30": 5,
            "produced_amount60": 8,
          },
          "buddy2": {
            "id": 1,
            "ingredient0": "Honey",
            "ingredient30": "Honey",
            "ingredient60": "Honey",
            "produced_amount0": 2,
            "produced_amount30": 5,
            "produced_amount60": 8,
          },
        },
        {
          "buddy1": {
            "id": 1,
            "ingredient0": "Honey",
            "ingredient30": "Honey",
            "ingredient60": "Honey",
            "produced_amount0": 2,
            "produced_amount30": 5,
            "produced_amount60": 8,
          },
          "buddy2": {
            "id": 2,
            "ingredient0": "Milk",
            "ingredient30": "Milk",
            "ingredient60": "Cacao",
            "produced_amount0": 2,
            "produced_amount30": 5,
            "produced_amount60": 5,
          },
        },
        {
          "buddy1": {
            "id": 1,
            "ingredient0": "Honey",
            "ingredient30": "Honey",
            "ingredient60": "Honey",
            "produced_amount0": 2,
            "produced_amount30": 5,
            "produced_amount60": 8,
          },
          "buddy2": {
            "id": 3,
            "ingredient0": "Cacao",
            "ingredient30": "Cacao",
            "ingredient60": "Apple",
            "produced_amount0": 2,
            "produced_amount30": 5,
            "produced_amount60": 12,
          },
        },
        {
          "buddy1": {
            "id": 2,
            "ingredient0": "Milk",
            "ingredient30": "Milk",
            "ingredient60": "Cacao",
            "produced_amount0": 2,
            "produced_amount30": 5,
            "produced_amount60": 5,
          },
          "buddy2": {
            "id": 2,
            "ingredient0": "Milk",
            "ingredient30": "Milk",
            "ingredient60": "Cacao",
            "produced_amount0": 2,
            "produced_amount30": 5,
            "produced_amount60": 5,
          },
        },
        {
          "buddy1": {
            "id": 2,
            "ingredient0": "Milk",
            "ingredient30": "Milk",
            "ingredient60": "Cacao",
            "produced_amount0": 2,
            "produced_amount30": 5,
            "produced_amount60": 5,
          },
          "buddy2": {
            "id": 3,
            "ingredient0": "Cacao",
            "ingredient30": "Cacao",
            "ingredient60": "Apple",
            "produced_amount0": 2,
            "produced_amount30": 5,
            "produced_amount60": 12,
          },
        },
        {
          "buddy1": {
            "id": 3,
            "ingredient0": "Cacao",
            "ingredient30": "Cacao",
            "ingredient60": "Apple",
            "produced_amount0": 2,
            "produced_amount30": 5,
            "produced_amount60": 12,
          },
          "buddy2": {
            "id": 3,
            "ingredient0": "Cacao",
            "ingredient30": "Cacao",
            "ingredient60": "Apple",
            "produced_amount0": 2,
            "produced_amount30": 5,
            "produced_amount60": 12,
          },
        },
      ]
    `);
  });
});
