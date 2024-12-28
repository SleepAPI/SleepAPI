import { describe, expect, it } from 'vitest';
import { BELUE } from '../../domain/berry';
import { BALANCED_GENDER } from '../../domain/gender/gender';
import { SLOWPOKE_TAIL } from '../../domain/ingredient';
import { HELPER_BOOST } from '../../domain/mainskill/mainskills/helper-boost';
import type { Pokemon } from '../../domain/pokemon';
import { PINSIR } from '../../domain/pokemon';
import { getPokemon, maxCarrySize } from './pokemon-utils';

const MOCK_POKEMON: Pokemon = {
  name: 'Mockemon',
  specialty: 'berry',
  frequency: 0,
  ingredientPercentage: 0,
  skillPercentage: 0,
  berry: BELUE,
  genders: BALANCED_GENDER,
  carrySize: 0,
  previousEvolutions: 1,
  remainingEvolutions: 1,
  ingredient0: { amount: 0, ingredient: SLOWPOKE_TAIL },
  ingredient30: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
  ingredient60: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
  skill: HELPER_BOOST
};

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
