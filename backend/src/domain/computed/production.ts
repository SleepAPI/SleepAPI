import { Nature } from '../stat/nature';
import { SubSkill } from '../stat/subskill';

export interface ProductionFilter {
  level: number;
  nature: Nature;
  subskills: SubSkill[];
  e4eProcs: number;
  helpingBonus: number;
  goodCamp: boolean;
}
