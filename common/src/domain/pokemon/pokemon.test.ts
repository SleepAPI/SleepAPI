import { describe, expect, it } from 'vitest';
import { COMPLETE_POKEDEX, Pokemon } from './pokemon';

describe('remainingEvolutions', () => {
  it('shall never be negative', () => {
    COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
      expect(pokemon.remainingEvolutions).toBeGreaterThanOrEqual(0);
    });
  });

  it('shall not exceed 2', () => {
    COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
      expect(pokemon.remainingEvolutions).toBeLessThanOrEqual(2);
    });
  });
});

describe('previousEvolutions', () => {
  it('shall never be negative', () => {
    COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
      expect(pokemon.previousEvolutions).toBeGreaterThanOrEqual(0);
    });
  });

  it('shall not exceed 2', () => {
    COMPLETE_POKEDEX.forEach((pokemon: Pokemon) => {
      expect(pokemon.previousEvolutions).toBeLessThanOrEqual(2);
    });
  });
});
