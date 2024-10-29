import { describe, expect, it } from 'vitest';
import { BELUE, Berry, ORAN } from '../../domain/berry';
import { BerrySet } from '../../domain/types/berry-set';
import { berryPowerForLevel, emptyBerryInventory, multiplyBerries, prettifyBerries, roundBerries } from './berry-utils';

const testBerry: Berry = { name: 'Oran', value: 10, type: 'water' };
const testBerries: BerrySet[] = [
  { berry: testBerry, amount: 15, level: 3 },
  { berry: testBerry, amount: 10, level: 2 },
  { berry: testBerry, amount: 5, level: 1 },
];

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

describe('multiplyBerries', () => {
  it('multiplies the amount of each berry by the given factor', () => {
    const result = multiplyBerries(testBerries, 2);
    expect(result).toEqual([
      { berry: testBerry, amount: 30, level: 3 },
      { berry: testBerry, amount: 20, level: 2 },
      { berry: testBerry, amount: 10, level: 1 },
    ]);
  });
});

describe('roundBerries', () => {
  it('rounds the amount of each berry to the given precision', () => {
    const result = roundBerries(
      [
        { berry: testBerry, amount: 15.128361, level: 3 },
        { berry: testBerry, amount: 10.128361, level: 2 },
      ],
      1,
    );
    expect(result).toEqual([
      { berry: testBerry, amount: 15.1, level: 3 },
      { berry: testBerry, amount: 10.1, level: 2 },
    ]);
  });
});

describe('emptyBerryInventory', () => {
  it('returns an empty array', () => {
    expect(emptyBerryInventory()).toEqual([]);
  });
});

describe('prettifyBerries', () => {
  it('returns a formatted string of berry amounts and names', () => {
    const result = prettifyBerries(testBerries);
    expect(result).toBe('15 Oran, 10 Oran, 5 Oran');
  });

  it('allows a custom separator', () => {
    const result = prettifyBerries(testBerries, ' | ');
    expect(result).toBe('15 Oran | 10 Oran | 5 Oran');
  });
});
