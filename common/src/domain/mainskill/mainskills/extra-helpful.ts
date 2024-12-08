import { MAX_SKILL_LEVEL } from '../../constants';
import { INGREDIENT_SUPPORT_MAINSKILLS, MAINSKILLS, METRONOME_SKILLS, Mainskill, createBaseSkill } from '../mainskill';

export const EXTRA_HELPFUL_S: Mainskill = createBaseSkill({
  name: 'Extra Helpful S',
  amount: [5, 6, 7, 8, 9, 10, 11],
  unit: 'helps',
  maxLevel: MAX_SKILL_LEVEL,
  description: 'Instantly gets you x? the usual help from a helper Pokémon.',
  RP: [880, 1251, 1726, 2383, 3290, 4546, 5843]
});

MAINSKILLS.push(EXTRA_HELPFUL_S);
METRONOME_SKILLS.push(EXTRA_HELPFUL_S);
INGREDIENT_SUPPORT_MAINSKILLS.push(EXTRA_HELPFUL_S);
