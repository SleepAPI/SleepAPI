import { pokemon, subskill } from 'sleepapi-common';
import { calculateNrOfBerriesPerDrop } from './berry-calculator';

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
