import { describe, expect, it } from 'vitest';
import { CHARGE_STRENGTH_S, COOKING_POWER_UP_S, MainSkill } from './mainskill';
import { unitString } from './mainskill-type';

describe('unitString', () => {
  it('returns correct string for stockpile', () => {
    const stockpileSkill: MainSkill = COOKING_POWER_UP_S;
    expect(unitString(stockpileSkill)).toBe('pot size');
  });

  it('returns correct string for non-stockpile', () => {
    const mainSkill: MainSkill = CHARGE_STRENGTH_S;
    expect(unitString(mainSkill)).toBe('strength');
  });
});
