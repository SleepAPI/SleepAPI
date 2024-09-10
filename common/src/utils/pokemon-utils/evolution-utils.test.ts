import { describe, expect, it } from 'vitest';
import { MOCK_POKEMON } from '../../mocks';
import { evolvesFrom, evolvesInto } from './evolution-utils';

describe('evolvesFrom', () => {
  it('shall have 1 fewer remaining evolution', () => {
    expect(evolvesFrom(MOCK_POKEMON).remainingEvolutions).toBe(0);
  });

  it('shall have 1 more previous evolution', () => {
    expect(evolvesFrom(MOCK_POKEMON).previousEvolutions).toBe(2);
  });
});

describe('evolvesInto', () => {
  it('shall have 1 more remaining evolution', () => {
    expect(evolvesInto(MOCK_POKEMON).remainingEvolutions).toBe(2);
  });

  it('shall have 1 fewer previous evolution', () => {
    expect(evolvesInto(MOCK_POKEMON).previousEvolutions).toBe(0);
  });
});
