import { berry, pokemon, subskill } from 'sleepapi-common';
import { calculateNrOfBerriesPerDrop, emptyBerrySet } from './berry-calculator';

describe('calculateNrOfBerriesPerDrop', () => {
  it('shall give 2 berries for berry specialty', () => {
    expect(calculateNrOfBerriesPerDrop(pokemon.RAICHU, [])).toBe(2);
  });

  it('shall give 3 berries for berry specialty with BFS', () => {
    expect(calculateNrOfBerriesPerDrop(pokemon.RAICHU, [subskill.BERRY_FINDING_S])).toBe(3);
  });

  it('shall give 1 berry for ingredient specialty', () => {
    expect(calculateNrOfBerriesPerDrop(pokemon.DRAGONITE, [])).toBe(1);
  });

  it('shall give 2 berries for skill specialty with BFS', () => {
    expect(calculateNrOfBerriesPerDrop(pokemon.GALLADE, [subskill.BERRY_FINDING_S])).toBe(2);
  });
});

describe('emptyBerrySet', () => {
  it('shall give empty berries', () => {
    expect(emptyBerrySet(berry.BELUE)).toMatchInlineSnapshot(`
      {
        "amount": 0,
        "berry": {
          "name": "BELUE",
          "value": 33,
        },
      }
    `);
  });
});
