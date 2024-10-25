import { MainSkill } from './mainskill';
import { Modifier } from './modifiers';

export type Energy = 'energy';
export type Berries = 'berries';
export type Ingredients = 'ingredients';
export type Helps = 'helps';
export type DreamShards = 'dream shards';
export type Strength = 'strength';
export type PotSize = 'pot size';
export type TastyChance = 'chance';
export type Metronome = 'metronome';

export type BasicSkillType =
  | Energy
  | Ingredients
  | Berries
  | Helps
  | DreamShards
  | Strength
  | PotSize
  | TastyChance
  | Metronome;

export function unitString(mainskill: MainSkill): string {
  if (typeof mainskill.unit === 'object' && 'type' in mainskill.unit && 'value' in mainskill.unit) {
    return mainskill.unit.value.toLowerCase();
  }
  return mainskill.unit.toLowerCase();
}

export const Energy: Energy = 'energy';
export const Ingredients: Ingredients = 'ingredients';
export const Berries: Berries = 'berries';
export const Helps: Helps = 'helps';
export const DreamShards: DreamShards = 'dream shards';
export const Strength: Strength = 'strength';
export const PotSize: PotSize = 'pot size';
export const TastyChance: TastyChance = 'chance';
export const Metronome: Metronome = 'metronome';

export type MainSkillType = BasicSkillType | Modifier<BasicSkillType>;
