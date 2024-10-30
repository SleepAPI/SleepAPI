import { MainskillUnit } from './mainskill-unit';

import { ModifierType } from './modifier';

export type MainskillAttributes = {
  name: string;
  amount: number[];
  unit: MainskillUnit;
  maxLevel: number;
  description: string;
  RP: number[];
  modifier: ModifierType;
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

  get amount() {
    return this.attributes.amount;
  }

  get unit() {
    return this.attributes.unit;
  }

  get modifier() {
    return this.attributes.modifier;
  }

  get isModified(): boolean {
    return this.modifier !== 'Base';
  }

  get RP() {
    return this.attributes.RP;
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
  // TODO: test that we can invoke like isUnit('strength') and isUnit('strength', 'pot size')
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
    return this.isModified && (!modifierType || this.modifier === modifierType) && this.name.includes(skill.name);
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
    modifier: 'Base',
  });
};

export const MAINSKILLS: Mainskill[] = [];
