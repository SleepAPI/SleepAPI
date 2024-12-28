import { MAX_SKILL_LEVEL } from '../../constants';
import type { Mainskill } from '../mainskill';
import { MAINSKILLS, createBaseSkill } from '../mainskill';

export const METRONOME: Mainskill = createBaseSkill({
  name: 'Metronome',
  amount: [1, 2, 3, 4, 5, 6], // max level rolls max level amount of chosen skill
  unit: 'metronome',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Uses one randomly chosen main skill.',
  RP: [880, 1251, 1726, 2383, 3290, 4546]
});
MAINSKILLS.push(METRONOME);
