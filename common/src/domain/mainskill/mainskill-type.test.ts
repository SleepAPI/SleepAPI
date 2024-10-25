import { describe, expect, it } from 'vitest';
import {
  CHARGE_STRENGTH_S,
  COOKING_POWER_UP_S,
  DREAM_SHARD_MAGNET_S,
  EXTRA_HELPFUL_S,
  METRONOME,
  MainSkill,
  TASTY_CHANCE_S,
} from './mainskill';
import {
  DreamShards,
  Energy,
  Metronome,
  PotSize,
  Stockpile,
  isSkillOrStockpileOf,
  isStockpile,
  unitString,
} from './mainskill-type';

describe('MainSkill Utility Functions', () => {
  it('Stockpile function creates correct object', () => {
    const stockpile = Stockpile('energy');
    expect(stockpile).toEqual({ stockpile: 'energy' });
  });

  it('isStockpile identifies a stockpile object', () => {
    const stockpile = Stockpile('ingredients');
    const nonStockpile: MainSkill = CHARGE_STRENGTH_S;

    expect(isStockpile(stockpile)).toBe(true);
    expect(isStockpile(nonStockpile.unit)).toBe(false);
  });

  it('unitString returns correct string for stockpile', () => {
    const stockpileSkill: MainSkill = COOKING_POWER_UP_S;
    expect(unitString(stockpileSkill)).toBe('pot size');
  });

  it('unitString returns correct string for non-stockpile', () => {
    const mainSkill: MainSkill = CHARGE_STRENGTH_S;
    expect(unitString(mainSkill)).toBe('strength');
  });

  it('isSkillOrStockpileOf returns true for matching stockpile', () => {
    const mainSkill: MainSkill = DREAM_SHARD_MAGNET_S;
    expect(isSkillOrStockpileOf(mainSkill, DreamShards)).toBe(true);
  });

  it('isSkillOrStockpileOf returns false for non-matching stockpile', () => {
    const mainSkill: MainSkill = EXTRA_HELPFUL_S;
    expect(isSkillOrStockpileOf(mainSkill, Energy)).toBe(false);
  });

  it('isSkillOrStockpileOf returns true for matching non-stockpile skill', () => {
    const mainSkill: MainSkill = METRONOME;
    expect(isSkillOrStockpileOf(mainSkill, Metronome)).toBe(true);
  });

  it('isSkillOrStockpileOf returns false for non-matching non-stockpile skill', () => {
    const mainSkill: MainSkill = TASTY_CHANCE_S;
    expect(isSkillOrStockpileOf(mainSkill, PotSize)).toBe(false);
  });
});
