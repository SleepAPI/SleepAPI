import { Mainskill, MainskillAttributes } from './mainskill';

// TODO: this is rapidly increasing, they might be moving into each skill's own file, they seem to be mon-specific
export type ModifierType = 'Base' | 'Stockpile' | 'Moonlight' | 'Disguise' | 'Mimic' | 'Transform';
export interface Modifier {
  type: ModifierType;
  critChance: number;
}

export const createModifier = (
  modifier: Modifier,
  skill: Mainskill,
  overrides?: Partial<MainskillAttributes>,
): Mainskill => {
  return new Mainskill({
    ...skill.attributes,
    ...overrides,
    name: `${modifier.type} (${skill.name})`,
    modifier,
  });
};

export const Stockpile = (skill: Mainskill, critChance: number, overrides?: Partial<MainskillAttributes>): Mainskill =>
  createModifier({ type: 'Stockpile', critChance }, skill, overrides);

export const Moonlight = (skill: Mainskill, critChance: number, overrides?: Partial<MainskillAttributes>): Mainskill =>
  createModifier({ type: 'Moonlight', critChance }, skill, overrides);

export const Disguise = (skill: Mainskill, critChance: number, overrides?: Partial<MainskillAttributes>): Mainskill =>
  createModifier({ type: 'Disguise', critChance }, skill, overrides);

export const Mimic = (skill: Mainskill, critChance: number, overrides?: Partial<MainskillAttributes>): Mainskill =>
  createModifier({ type: 'Mimic', critChance }, skill, overrides);

export const Transform = (skill: Mainskill, critChance: number, overrides?: Partial<MainskillAttributes>): Mainskill =>
  createModifier({ type: 'Transform', critChance }, skill, overrides);
