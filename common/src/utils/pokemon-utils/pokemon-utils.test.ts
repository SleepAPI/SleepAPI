import { describe, expect, it } from 'vitest';
import { PINSIR } from '../../domain/pokemon';
import { MOCK_POKEMON } from '../../mocks';
import { getPokemon, maxCarrySize } from './pokemon-utils';

describe('getPokemon', () => {
  it('shall return PINSIR for pinSIr name', () => {
    expect(getPokemon('pinSIr')).toBe(PINSIR);
  });

  it("shall throw if Pokémon can't be found", () => {
    expect(() => getPokemon('missing')).toThrow(Error);
  });
});

describe('maxCarrySize', () => {
  it('shall return 5 for MOCK_POKEMON', () => {
    expect(maxCarrySize(MOCK_POKEMON)).toBe(5);
  });
});
