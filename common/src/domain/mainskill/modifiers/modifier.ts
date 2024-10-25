import { MainSkill } from '../mainskill';
import { BasicSkillType, MainSkillType } from '../mainskill-type';

export interface Modifier<T extends BasicSkillType> {
  type: string;
  value: T;
}

export const createModifier = <T extends BasicSkillType>(type: string, value: T): Modifier<T> => ({
  type,
  value,
});

export function isModifierOfType<T extends BasicSkillType>(
  unit: MainSkillType,
  modifierType: string,
): unit is Modifier<T> {
  return typeof unit === 'object' && 'type' in unit && unit.type === modifierType;
}

export function isSkillOrModifierOf(mainskill: MainSkill, skillType: BasicSkillType, modifierType?: string): boolean {
  if (typeof mainskill.unit === 'object' && 'type' in mainskill.unit) {
    return (!modifierType || mainskill.unit.type === modifierType) && mainskill.unit.value === skillType;
  }
  return mainskill.unit === skillType;
}

export function isModifier(unit: MainSkillType): unit is Modifier<BasicSkillType> {
  return typeof unit === 'object' && 'type' in unit && 'value' in unit;
}
