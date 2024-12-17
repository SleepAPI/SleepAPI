import { MAX_SKILL_LEVEL } from '../../constants';
import { MAINSKILLS, METRONOME_SKILLS, Mainskill, createBaseSkill } from '../mainskill';

export const INGREDIENT_MAGNET_S: Mainskill = createBaseSkill({
  name: 'Ingredient Magnet S',
  amount: [6, 8, 11, 14, 17, 21, 24],
  unit: 'ingredients',
  maxLevel: MAX_SKILL_LEVEL,
  description: 'Gets you ? ingredients chosen at random.',
  RP: [880, 1251, 1726, 2383, 3290, 4546, 5843],
});

MAINSKILLS.push(INGREDIENT_MAGNET_S);
METRONOME_SKILLS.push(INGREDIENT_MAGNET_S);
