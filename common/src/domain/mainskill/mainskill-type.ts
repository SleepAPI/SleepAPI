import { MainSkill } from './mainskill';

export type Energy = 'energy';
export type Ingredients = 'ingredients';
export type Helps = 'helps';
export type DreamShards = 'dream shards';
export type Strength = 'strength';
export type PotSize = 'pot size';
export type TastyChance = 'chance';
export type Metronome = 'metronome';

export type BasicSkillType = Energy | Ingredients | Helps | DreamShards | Strength | PotSize | TastyChance | Metronome;
export interface Stockpile<T extends BasicSkillType> {
  stockpile: T;
}
export const Stockpile = <T extends BasicSkillType>(type: T): Stockpile<T> => ({
  stockpile: type,
});
export function isStockpile(unit: MainSkillType): unit is Stockpile<BasicSkillType> {
  return typeof unit === 'object' && 'stockpile' in unit;
}
export function unitString(mainskill: MainSkill): string {
  if (typeof mainskill.unit === 'object' && 'stockpile' in mainskill.unit) {
    return mainskill.unit.stockpile.toLowerCase();
  }
  return mainskill.unit.toLowerCase();
}
export function isSkillOrStockpileOf(mainskill: MainSkill, skillType: BasicSkillType): boolean {
  if (typeof mainskill.unit === 'object' && 'stockpile' in mainskill.unit) {
    return mainskill.unit.stockpile === skillType;
  }
  return mainskill.unit === skillType;
}

export const Energy: Energy = 'energy';
export const Ingredients: Ingredients = 'ingredients';
export const Helps: Helps = 'helps';
export const DreamShards: DreamShards = 'dream shards';
export const Strength: Strength = 'strength';
export const PotSize: PotSize = 'pot size';
export const TastyChance: TastyChance = 'chance';
export const Metronome: Metronome = 'metronome';
export const StockpileStrength: Stockpile<'strength'> = Stockpile('strength');

export type MainSkillType = BasicSkillType | Stockpile<BasicSkillType>;
