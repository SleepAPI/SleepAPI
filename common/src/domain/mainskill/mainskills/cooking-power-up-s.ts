import { MAX_SKILL_LEVEL } from '../../constants';
import { MAINSKILLS, METRONOME_SKILLS, Mainskill, createBaseSkill } from '../mainskill';

export const COOKING_POWER_UP_S: Mainskill = createBaseSkill({
  name: 'Cooking Power-up S',
  amount: [7, 10, 12, 17, 22, 27, 32],
  unit: 'pot size',
  maxLevel: MAX_SKILL_LEVEL,
  description: 'Gives your pot room for ? more ingredients next time you cook.',
  RP: [880, 1251, 1726, 2383, 3290, 4546, 5843],
});

MAINSKILLS.push(COOKING_POWER_UP_S);
METRONOME_SKILLS.push(COOKING_POWER_UP_S);
