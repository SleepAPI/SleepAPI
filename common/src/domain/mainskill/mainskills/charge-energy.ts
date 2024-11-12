import { MAX_SKILL_LEVEL } from '../../constants';
import { MAINSKILLS, Mainskill, createBaseSkill } from '../mainskill';

export const CHARGE_ENERGY_S: Mainskill = createBaseSkill({
  name: 'Charge Energy S',
  amount: [12, 16.2, 21.2, 26.6, 33.6, 43.4],
  unit: 'energy',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Restores ? Energy to the user.',
  RP: [400, 569, 785, 1083, 1496, 2066],
});
MAINSKILLS.push(CHARGE_ENERGY_S);
