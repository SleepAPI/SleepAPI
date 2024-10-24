import { BasicSkillType, MainSkillType } from '../mainskill-type';
import { Modifier, createModifier, isModifierOfType } from './modifier';

export type Moonlight<T extends BasicSkillType> = Modifier<T>;

export const Moonlight = <T extends BasicSkillType>(type: T): Moonlight<T> => createModifier('moonlight', type);

export function isMoonlight(unit: MainSkillType): unit is Moonlight<BasicSkillType> {
  return isModifierOfType(unit, 'moonlight');
}

export const MoonlightEnergy: Moonlight<'energy'> = Moonlight('energy');
