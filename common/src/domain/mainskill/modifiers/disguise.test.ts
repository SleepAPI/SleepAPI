import { describe, expect, it } from 'vitest';
import { CHARGE_STRENGTH_S, MainSkill } from '../mainskill';
import { Disguise, isDisguise } from './disguise';

describe('Disguise', () => {
  it('Disguise function creates correct object', () => {
    const disguise = Disguise('berries');
    expect(disguise).toEqual({ type: 'disguise', value: 'berries' });
  });
});

describe('isDisguise', () => {
  it('isDisguise identifies a disguise object', () => {
    const disguise = Disguise('ingredients');
    const nonDisguise: MainSkill = CHARGE_STRENGTH_S;

    expect(isDisguise(disguise)).toBe(true);
    expect(isDisguise(nonDisguise.unit)).toBe(false);
  });
});
