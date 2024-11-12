import { MAX_SKILL_LEVEL } from '../../constants';
import { MAINSKILLS, Mainskill, createBaseSkill } from '../mainskill';

export const CHARGE_STRENGTH_M: Mainskill = createBaseSkill({
  name: 'Charge Strength M',
  amount: [880, 1251, 1726, 2383, 3290, 4546, 6409],
  unit: 'strength',
  maxLevel: MAX_SKILL_LEVEL,
  description: "Increases Snorlax's Strength by ?.",
  RP: [880, 1251, 1726, 2383, 3290, 4546, 5843],
});
MAINSKILLS.push(CHARGE_STRENGTH_M);
