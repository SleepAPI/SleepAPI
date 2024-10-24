import { BasicSkillType, MainSkillType } from '../mainskill-type';
import { Modifier, createModifier, isModifierOfType } from './modifier';

export type Stockpile<T extends BasicSkillType> = Modifier<T>;

export const Stockpile = <T extends BasicSkillType>(type: T): Stockpile<T> => createModifier('stockpile', type);

export function isStockpile(unit: MainSkillType): unit is Stockpile<BasicSkillType> {
  return isModifierOfType(unit, 'stockpile');
}

export const StockpileStrength: Stockpile<'strength'> = Stockpile('strength');
