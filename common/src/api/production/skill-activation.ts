import { Produce } from '../../api/production/produce';
import { Mainskill } from '../../domain/mainskill/mainskill';

export interface SkillActivation {
  skill: Mainskill;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  fractionOfProc: number;
  adjustedProduce?: Produce;
}
