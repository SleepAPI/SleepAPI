import { describe, expect, it } from 'vitest';
import { BELUE } from '../../domain/berry';
import { SLOWPOKE_TAIL } from '../../domain/ingredient';
import { HELPER_BOOST } from '../../domain/mainskill';
import { Pokemon } from '../../domain/pokemon';
import { evolvesFrom, evolvesInto } from './evolution-utils';

const MOCK_POKEMON: Pokemon = {
  name: 'Mockemon',
  specialty: 'berry',
  frequency: 0,
  ingredientPercentage: 0,
  skillPercentage: 0,
  berry: BELUE,
  carrySize: 0,
  maxCarrySize: 5,
  remainingEvolutions: 1,
  ingredient0: { amount: 0, ingredient: SLOWPOKE_TAIL },
  ingredient30: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
  ingredient60: [{ amount: 0, ingredient: SLOWPOKE_TAIL }],
  skill: HELPER_BOOST,
};

describe('evolvesFrom', () => {
  it('shall have 1 fewer remaining evolution', () => {
    expect(evolvesFrom(MOCK_POKEMON).remainingEvolutions).toBe(0);
  });
});

describe('evolvesInto', () => {
  it('shall have 1 more remaining evolution', () => {
    expect(evolvesInto(MOCK_POKEMON).remainingEvolutions).toBe(2);
  });
});
