import { describe, expect, it } from 'vitest';
import { BELUE, ORAN } from '../../domain/berry';
import { berryPowerForLevel } from './berry-utils';

describe('berryPowerForLevel', () => {
  it('shall return expected oran berry power for multiple breakpoints', () => {
    expect(berryPowerForLevel(ORAN, 1)).toBe(31);
    expect(berryPowerForLevel(ORAN, 10)).toBe(40);
    expect(berryPowerForLevel(ORAN, 30)).toBe(63);
    expect(berryPowerForLevel(ORAN, 50)).toBe(104);
    expect(berryPowerForLevel(ORAN, 55)).toBe(118);
    expect(berryPowerForLevel(ORAN, 60)).toBe(133);
  });

  it('shall return expected belue berry power for multiple breakpoints', () => {
    expect(berryPowerForLevel(BELUE, 1)).toBe(33);
    expect(berryPowerForLevel(BELUE, 10)).toBe(42);
    expect(berryPowerForLevel(BELUE, 30)).toBe(68);
    expect(berryPowerForLevel(BELUE, 50)).toBe(111);
    expect(berryPowerForLevel(BELUE, 55)).toBe(125);
    expect(berryPowerForLevel(BELUE, 60)).toBe(142);
  });
});
