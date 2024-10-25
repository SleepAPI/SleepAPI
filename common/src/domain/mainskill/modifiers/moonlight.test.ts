import { describe, expect, it } from 'vitest';
import { CHARGE_STRENGTH_S, MainSkill } from '../mainskill';
import { Moonlight, isMoonlight } from './moonlight';

describe('Moonlight', () => {
  it('Moonlight function creates correct object', () => {
    const moonlight = Moonlight('energy');
    expect(moonlight).toEqual({ type: 'moonlight', value: 'energy' });
  });
});

describe('isMoonlight', () => {
  it('isMoonlight identifies a moonlight object', () => {
    const moonlight = Moonlight('ingredients');
    const nonMoonlight: MainSkill = CHARGE_STRENGTH_S;

    expect(isMoonlight(moonlight)).toBe(true);
    expect(isMoonlight(nonMoonlight.unit)).toBe(false);
  });
});
