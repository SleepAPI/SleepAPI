import { describe, expect, it } from 'vitest';
import { MainskillAttributes } from './mainskill';
import { Disguise, Moonlight, Stockpile, createModifier } from './modifier';

const baseSkill: MainskillAttributes = {
  name: 'Charge Energy S',
  amount: [12, 16, 21, 26, 33, 43],
  unit: 'energy',
  maxLevel: 6,
  description: 'Restores ? Energy to the user.',
  RP: [400, 569, 785, 1083, 1496, 2066],
  modifier: 'Base',
};

describe('Create modifier', () => {
  it('should create a modifier with createModifier', () => {
    const modifiedSkill = createModifier('Stockpile', baseSkill, {
      description: 'Modified description',
    });

    expect(modifiedSkill.name).toBe('Stockpile (Charge Energy S)');
    expect(modifiedSkill.description).toBe('Modified description');
    expect(modifiedSkill.modifier).toBe('Stockpile');
    expect(modifiedSkill.isModified).toBe(true);
  });

  it('should create a Stockpile modifier', () => {
    const stockpileSkill = Stockpile(baseSkill);

    expect(stockpileSkill.name).toBe('Stockpile (Charge Energy S)');
    expect(stockpileSkill.modifier).toBe('Stockpile');
    expect(stockpileSkill.isModified).toBe(true);
  });

  it('should create a Stockpile modifier with overrides', () => {
    const stockpileSkill = Stockpile(baseSkill, { maxLevel: 8 });

    expect(stockpileSkill.name).toBe('Stockpile (Charge Energy S)');
    expect(stockpileSkill.maxLevel).toBe(8);
    expect(stockpileSkill.modifier).toBe('Stockpile');
    expect(stockpileSkill.isModified).toBe(true);
  });

  it('should create a Moonlight modifier', () => {
    const moonlightSkill = Moonlight(baseSkill);

    expect(moonlightSkill.name).toBe('Moonlight (Charge Energy S)');
    expect(moonlightSkill.modifier).toBe('Moonlight');
    expect(moonlightSkill.isModified).toBe(true);
  });

  it('should create a Moonlight modifier with overrides', () => {
    const moonlightSkill = Moonlight(baseSkill, { maxLevel: 4 });

    expect(moonlightSkill.name).toBe('Moonlight (Charge Energy S)');
    expect(moonlightSkill.maxLevel).toBe(4);
    expect(moonlightSkill.modifier).toBe('Moonlight');
    expect(moonlightSkill.isModified).toBe(true);
  });

  it('should create a Disguise modifier', () => {
    const disguiseSkill = Disguise(baseSkill);

    expect(disguiseSkill.name).toBe('Disguise (Charge Energy S)');
    expect(disguiseSkill.modifier).toBe('Disguise');
    expect(disguiseSkill.isModified).toBe(true);
  });

  it('should create a Disguise modifier with overrides', () => {
    const disguiseSkill = Disguise(baseSkill, { description: 'Disguised description' });

    expect(disguiseSkill.name).toBe('Disguise (Charge Energy S)');
    expect(disguiseSkill.description).toBe('Disguised description');
    expect(disguiseSkill.modifier).toBe('Disguise');
    expect(disguiseSkill.isModified).toBe(true);
  });

  it('should apply multiple overrides', () => {
    const overrides = {
      amount: [15, 20, 25],
      maxLevel: 3,
      description: 'Overridden description',
    };
    const modifiedSkill = createModifier('Moonlight', baseSkill, overrides);

    expect(modifiedSkill.amount).toEqual([15, 20, 25]);
    expect(modifiedSkill.maxLevel).toBe(3);
    expect(modifiedSkill.description).toBe('Overridden description');
  });

  it('should retain base properties when no overrides are provided', () => {
    const modifiedSkill = createModifier('Base', baseSkill);

    expect(modifiedSkill.name).toBe('Base (Charge Energy S)');
    expect(modifiedSkill.amount).toEqual([12, 16, 21, 26, 33, 43]);
    expect(modifiedSkill.unit).toBe('energy');
    expect(modifiedSkill.maxLevel).toBe(6);
    expect(modifiedSkill.description).toBe('Restores ? Energy to the user.');
    expect(modifiedSkill.RP).toEqual([400, 569, 785, 1083, 1496, 2066]);
    expect(modifiedSkill.modifier).toBe('Base');
  });
});
