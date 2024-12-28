import type { Produce } from '../../api/production/produce';
import type { Mainskill } from '../../domain/mainskill/mainskill';

export interface SkillActivation {
  skill: Mainskill;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  fractionOfProc: number;
  critChance?: number;
  adjustedProduce?: Produce;
}
