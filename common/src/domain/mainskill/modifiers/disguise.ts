import { BasicSkillType, MainSkillType } from '../mainskill-type';
import { Modifier, createModifier, isModifierOfType } from './modifier';

export type Disguise<T extends BasicSkillType> = Modifier<T>;

export const Disguise = <T extends BasicSkillType>(type: T): Disguise<T> => createModifier('disguise', type);

export function isDisguise(unit: MainSkillType): unit is Disguise<BasicSkillType> {
  return isModifierOfType(unit, 'disguise');
}

export const DisguiseBerries: Disguise<'berries'> = Disguise('berries');
