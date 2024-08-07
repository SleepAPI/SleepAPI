import { Produce } from '../../api/production/produce';
import { MainSkill } from '../../domain/mainskill/mainskill';

export interface SkillActivation {
  skill: MainSkill;
  nrOfHelpsToActivate: number;
  adjustedAmount: number;
  fractionOfProc: number;
  adjustedProduce?: Produce;
}
