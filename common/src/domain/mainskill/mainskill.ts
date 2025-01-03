import type { MainskillUnit } from './mainskill-unit';

import type { Modifier, ModifierType } from './modifier';

// TODO: maxLevel could be calced auto from amount.length
export type MainskillAttributes = {
  name: string;
  amount: number[];
  unit: MainskillUnit;
  maxLevel: number;
  description: string;
  RP: number[];
  modifier: Modifier;
};
export class Mainskill {
  attributes: MainskillAttributes;

  constructor(attributes: MainskillAttributes) {
    this.attributes = attributes;
  }

  get name() {
    return this.attributes.name;
  }

  get maxLevel() {
    return this.attributes.maxLevel;
  }

  get description() {
    return this.attributes.description;
  }

  get amounts() {
    return this.attributes.amount;
  }

  get unit() {
    return this.attributes.unit;
  }

  get modifier() {
    return this.attributes.modifier;
  }

  get isModified(): boolean {
    return this.modifier.type !== 'Base';
  }

  get critChance() {
    return this.modifier.critChance;
  }

  get RP() {
    return this.attributes.RP;
  }

  get maxAmount() {
    return this.amounts[this.maxLevel - 1];
  }

  /**
   *
   * @returns amount for given skill level
   */
  public amount(skillLevel: number) {
    return this.amounts[skillLevel - 1];
  }

  /**
   * Checks if the current skill is the same as any of the provided skills.
   * @param skills The skill or array of skills to compare against.
   * @returns True if the current skill is the same as any of the provided skills.
   */
  isSkill(...skills: Mainskill[]): boolean {
    return skills.some((skill) => this.name === skill.name);
  }

  /**
   * Checks if the unit matches any of the provided units.
   * @param units The units to compare against.
   * @returns True if the current unit matches any of the provided units.
   */
  isUnit(...units: MainskillUnit[]): boolean {
    return units.includes(this.unit);
  }

  /**
   * Checks if the current skill is a modified version of the provided base skill.
   * @param skill The base skill to compare against.
   * @param modifierType Optional modifier type to check for.
   * @returns True if the current skill is a modified version of the provided base skill.
   */
  isModifiedVersionOf(skill: Mainskill, modifierType?: ModifierType): boolean {
    return this.isModified && (!modifierType || this.modifier.type === modifierType) && this.name.includes(skill.name);
  }

  /**
   * Checks if the current skill is either the skill itself or a modified version of it.
   * @param skill The base skill to compare against.
   * @param modifierType Optional modifier type to check for.
   * @returns True if the current skill is the same as the provided skill or a modified version of it.
   */
  isSameOrModifiedVersionOf(skill: Mainskill, modifierType?: ModifierType): boolean {
    return this.name === skill.name || this.isModifiedVersionOf(skill, modifierType);
  }

  toJSON() {
    return { ...this.attributes };
  }
}

export const createBaseSkill = (baseSkill: Omit<MainskillAttributes, 'modifier'>): Mainskill => {
  return new Mainskill({
    ...baseSkill,
    modifier: { type: 'Base', critChance: 0 }
  });
};

export const MAINSKILLS: Mainskill[] = [];
export const METRONOME_SKILLS: Mainskill[] = [];
export const INGREDIENT_SUPPORT_MAINSKILLS: Mainskill[] = [];
