import { describe, expect, it } from 'vitest';
import { Mainskill, MainskillAttributes, createBaseSkill } from './mainskill';
import { MainskillUnit } from './mainskill-unit';

const baseSkillAttributes: Omit<MainskillAttributes, 'modifier'> = {
  name: 'Charge Energy S',
  amount: [12, 16, 21, 26, 33, 43],
  unit: 'energy' as MainskillUnit,
  maxLevel: 6,
  description: 'Restores ? Energy to the user.',
  RP: [400, 569, 785, 1083, 1496, 2066],
};
const baseSkill = createBaseSkill(baseSkillAttributes);

const modifiedSkillAttributes: MainskillAttributes = {
  ...baseSkillAttributes,
  modifier: { type: 'Moonlight', critChance: 0.5 },
  name: 'Moonlight (Charge Energy S)',
};
const modifiedSkill = new Mainskill(modifiedSkillAttributes);

describe('Mainskill', () => {
  it('should create a base skill with createBaseSkill', () => {
    expect(baseSkill.name).toBe('Charge Energy S');
    expect(baseSkill.amounts).toEqual([12, 16, 21, 26, 33, 43]);
    expect(baseSkill.unit).toBe('energy');
    expect(baseSkill.maxLevel).toBe(6);
    expect(baseSkill.description).toBe('Restores ? Energy to the user.');
    expect(baseSkill.RP).toEqual([400, 569, 785, 1083, 1496, 2066]);
    expect(baseSkill.modifier.type).toBe('Base');
    expect(baseSkill.isModified).toBe(false);
  });

  it('should create a modified skill', () => {
    expect(modifiedSkill.name).toBe('Moonlight (Charge Energy S)');
    expect(modifiedSkill.modifier.type).toBe('Moonlight');
    expect(modifiedSkill.isModified).toBe(true);
  });

  it('should check if the skill is the same using isSkill()', () => {
    const anotherSkill = createBaseSkill({ ...baseSkillAttributes, name: 'Different Skill' });
    expect(baseSkill.isSkill(baseSkill)).toBe(true);
    expect(baseSkill.isSkill(baseSkill, anotherSkill)).toBe(true);
    expect(baseSkill.isSkill(anotherSkill)).toBe(false);
  });

  it('should check if the unit matches using isUnit()', () => {
    expect(baseSkill.isUnit('energy')).toBe(true);
    expect(baseSkill.isUnit('energy', 'strength')).toBe(true);
    expect(baseSkill.isUnit('strength')).toBe(false);
    expect(baseSkill.isUnit('berries', 'strength', 'ingredients')).toBe(false);
  });

  it('should check if the skill is a modified version of a base skill using isModifiedVersionOf()', () => {
    expect(modifiedSkill.isModifiedVersionOf(baseSkill)).toBe(true);
    expect(modifiedSkill.isModifiedVersionOf(baseSkill, 'Moonlight')).toBe(true);
    expect(modifiedSkill.isModifiedVersionOf(baseSkill, 'Stockpile')).toBe(false);
  });

  it('should check if the skill is the same or a modified version using isSameOrModifiedVersionOf()', () => {
    expect(modifiedSkill.isSameOrModifiedVersionOf(baseSkill)).toBe(true);
    expect(baseSkill.isSameOrModifiedVersionOf(baseSkill)).toBe(true);
    expect(baseSkill.isSameOrModifiedVersionOf(modifiedSkill)).toBe(false);
  });

  it('should convert skill to JSON using toJSON()', () => {
    expect(baseSkill.toJSON()).toEqual({ ...baseSkillAttributes, modifier: { type: 'Base', critChance: 0 } });
    expect(modifiedSkill.toJSON()).toEqual(modifiedSkillAttributes);
  });
});
