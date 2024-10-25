import { describe, expect, it } from 'vitest';
import {
  CHARGE_ENERGY_S,
  DREAM_SHARD_MAGNET_S,
  EXTRA_HELPFUL_S,
  METRONOME,
  MainSkill,
  TASTY_CHANCE_S,
} from '../mainskill';
import { DreamShards, Energy, Metronome, PotSize } from '../mainskill-type';
import { createModifier, isModifier, isModifierOfType, isSkillOrModifierOf } from './modifier';

describe('isSkillOrModifierOf', () => {
  it(' returns true for matching stockpile', () => {
    const mainSkill: MainSkill = DREAM_SHARD_MAGNET_S;
    expect(isSkillOrModifierOf(mainSkill, DreamShards)).toBe(true);
  });

  it(' returns false for non-matching stockpile', () => {
    const mainSkill: MainSkill = EXTRA_HELPFUL_S;
    expect(isSkillOrModifierOf(mainSkill, Energy)).toBe(false);
  });

  it(' returns true for matching non-stockpile skill', () => {
    const mainSkill: MainSkill = METRONOME;
    expect(isSkillOrModifierOf(mainSkill, Metronome)).toBe(true);
  });

  it(' returns false for non-matching non-stockpile skill', () => {
    const mainSkill: MainSkill = TASTY_CHANCE_S;
    expect(isSkillOrModifierOf(mainSkill, PotSize)).toBe(false);
  });
});

describe('isModifierOfType', () => {
  it('returns true for a matching modifier type', () => {
    const modifier = createModifier('modifierType', DreamShards);
    expect(isModifierOfType(modifier, 'modifierType')).toBe(true);
  });

  it('returns false for a non-matching modifier type', () => {
    const modifier = createModifier('modifierType', DreamShards);
    expect(isModifierOfType(modifier, 'differentType')).toBe(false);
  });
});

describe('isModifier', () => {
  it('returns true for a valid modifier', () => {
    const modifier = createModifier('modifierType', Energy);
    expect(isModifier(modifier)).toBe(true);
  });

  it('returns false for a basic skill object', () => {
    const nonModifier = CHARGE_ENERGY_S;
    expect(isModifier(nonModifier.unit)).toBe(false);
  });
});
