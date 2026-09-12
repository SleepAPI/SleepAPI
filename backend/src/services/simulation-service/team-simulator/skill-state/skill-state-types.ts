import type { Mainskill, MainskillTargeting, MainskillUnit } from 'sleepapi-common';

export interface ActivationValue {
  regular: number;
  crit: number;
}

export interface UnitActivation {
  unit: MainskillUnit;
  self?: ActivationValue;
  team?: ActivationValue;
}

export interface SkillActivation {
  skill: Mainskill;
  targeting?: MainskillTargeting;
  activations: UnitActivation[];
}
