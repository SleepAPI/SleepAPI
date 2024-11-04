import { describe, expect, it } from 'vitest';
import { Mainskill } from './mainskill';
import { Disguise, Moonlight, Stockpile, createModifier } from './modifier';

const baseSkill: Mainskill = new Mainskill({
  name: 'Charge Energy S',
  amount: [12, 16, 21, 26, 33, 43],
  unit: 'energy',
  maxLevel: 6,
  description: 'Restores ? Energy to the user.',
  RP: [400, 569, 785, 1083, 1496, 2066],
  modifier: { type: 'Base', critChance: 0 },
});

describe('Create modifier', () => {
  it('should create a modifier with createModifier', () => {
    const modifiedSkill = createModifier({ type: 'Stockpile', critChance: 0 }, baseSkill, {
      description: 'Modified description',
    });

    expect(modifiedSkill.name).toBe('Stockpile (Charge Energy S)');
    expect(modifiedSkill.description).toBe('Modified description');
    expect(modifiedSkill.modifier.type).toBe('Stockpile');
    expect(modifiedSkill.modifier.critChance).toBe(0);
    expect(modifiedSkill.isModified).toBe(true);
  });

  it('should create a Stockpile modifier', () => {
    const stockpileSkill = Stockpile(baseSkill, 0.3);

    expect(stockpileSkill.name).toBe('Stockpile (Charge Energy S)');
    expect(stockpileSkill.modifier.type).toBe('Stockpile');
    expect(stockpileSkill.modifier.critChance).toBe(0.3);
    expect(stockpileSkill.isModified).toBe(true);
  });

  it('should create a Stockpile modifier with overrides', () => {
    const stockpileSkill = Stockpile(baseSkill, 1, { maxLevel: 8 });

    expect(stockpileSkill.name).toBe('Stockpile (Charge Energy S)');
    expect(stockpileSkill.maxLevel).toBe(8);
    expect(stockpileSkill.modifier.type).toBe('Stockpile');
    expect(stockpileSkill.modifier.critChance).toBe(1);
    expect(stockpileSkill.isModified).toBe(true);
  });

  it('should create a Moonlight modifier', () => {
    const moonlightSkill = Moonlight(baseSkill, 0.1);

    expect(moonlightSkill.name).toBe('Moonlight (Charge Energy S)');
    expect(moonlightSkill.modifier.type).toBe('Moonlight');
    expect(moonlightSkill.modifier.critChance).toBe(0.1);
    expect(moonlightSkill.isModified).toBe(true);
  });

  it('should create a Moonlight modifier with overrides', () => {
    const moonlightSkill = Moonlight(baseSkill, 0.5, { maxLevel: 4 });

    expect(moonlightSkill.name).toBe('Moonlight (Charge Energy S)');
    expect(moonlightSkill.maxLevel).toBe(4);
    expect(moonlightSkill.modifier.type).toBe('Moonlight');
    expect(moonlightSkill.modifier.critChance).toBe(0.5);
    expect(moonlightSkill.isModified).toBe(true);
  });

  it('should create a Disguise modifier', () => {
    const disguiseSkill = Disguise(baseSkill, 0.7);

    expect(disguiseSkill.name).toBe('Disguise (Charge Energy S)');
    expect(disguiseSkill.modifier.type).toBe('Disguise');
    expect(disguiseSkill.modifier.critChance).toBe(0.7);
    expect(disguiseSkill.isModified).toBe(true);
  });

  it('should create a Disguise modifier with overrides', () => {
    const disguiseSkill = Disguise(baseSkill, 0.2, { description: 'Disguised description' });

    expect(disguiseSkill.name).toBe('Disguise (Charge Energy S)');
    expect(disguiseSkill.description).toBe('Disguised description');
    expect(disguiseSkill.modifier.type).toBe('Disguise');
    expect(disguiseSkill.modifier.critChance).toBe(0.2);
    expect(disguiseSkill.isModified).toBe(true);
  });

  it('should apply multiple overrides', () => {
    const overrides = {
      amount: [15, 20, 25],
      maxLevel: 3,
      description: 'Overridden description',
    };
    const modifiedSkill = createModifier({ type: 'Moonlight', critChance: 0 }, baseSkill, overrides);

    expect(modifiedSkill.amounts).toEqual([15, 20, 25]);
    expect(modifiedSkill.maxLevel).toBe(3);
    expect(modifiedSkill.description).toBe('Overridden description');
  });

  it('should retain base properties when no overrides are provided', () => {
    const modifiedSkill = createModifier({ type: 'Base', critChance: 0 }, baseSkill);

    expect(modifiedSkill.name).toBe('Base (Charge Energy S)');
    expect(modifiedSkill.amounts).toEqual([12, 16, 21, 26, 33, 43]);
    expect(modifiedSkill.unit).toBe('energy');
    expect(modifiedSkill.maxLevel).toBe(6);
    expect(modifiedSkill.description).toBe('Restores ? Energy to the user.');
    expect(modifiedSkill.RP).toEqual([400, 569, 785, 1083, 1496, 2066]);
    expect(modifiedSkill.modifier.type).toBe('Base');
    expect(modifiedSkill.modifier.critChance).toBe(0);
  });
});
