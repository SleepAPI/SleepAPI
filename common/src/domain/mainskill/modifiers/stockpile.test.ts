import { describe, expect, it } from 'vitest';
import { CHARGE_STRENGTH_S, MainSkill } from '../mainskill';
import { Stockpile, isStockpile } from './stockpile';

describe('Stockpile', () => {
  it('Stockpile function creates correct object', () => {
    const stockpile = Stockpile('energy');
    expect(stockpile).toEqual({ type: 'stockpile', value: 'energy' });
  });
});

describe('isStockpile', () => {
  it('isStockpile identifies a stockpile object', () => {
    const stockpile = Stockpile('ingredients');
    const nonStockpile: MainSkill = CHARGE_STRENGTH_S;

    expect(isStockpile(stockpile)).toBe(true);
    expect(isStockpile(nonStockpile.unit)).toBe(false);
  });
});
