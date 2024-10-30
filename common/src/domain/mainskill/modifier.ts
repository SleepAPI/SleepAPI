import { Mainskill, MainskillAttributes } from './mainskill';

export interface Modifier {
  type: string;
  skill: Mainskill;
  overrides?: Partial<Mainskill>;
}

export type ModifierType = 'Base' | 'Stockpile' | 'Moonlight' | 'Disguise';

export const createModifier = (
  type: ModifierType,
  skill: MainskillAttributes,
  overrides?: Partial<MainskillAttributes>,
): Mainskill => {
  return new Mainskill({
    ...skill,
    ...overrides,
    name: `${type} (${skill.name})`,
    modifier: type,
  });
};

export const Stockpile = (skill: MainskillAttributes, overrides?: Partial<MainskillAttributes>): Mainskill =>
  createModifier('Stockpile', skill, overrides);

export const Moonlight = (skill: MainskillAttributes, overrides?: Partial<MainskillAttributes>): Mainskill =>
  createModifier('Moonlight', skill, overrides);

export const Disguise = (skill: MainskillAttributes, overrides?: Partial<MainskillAttributes>): Mainskill =>
  createModifier('Disguise', skill, overrides);
