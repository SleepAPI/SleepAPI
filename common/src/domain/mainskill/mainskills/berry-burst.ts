import { MAX_SKILL_LEVEL } from '../../constants';
import type { Mainskill } from '../mainskill';
import { MAINSKILLS, METRONOME_SKILLS, createBaseSkill } from '../mainskill';

// TODO: skill doesn't exist yet, values are mock
export const BERRY_BURST: Mainskill = createBaseSkill({
  name: 'Berry Burst',
  amount: [8, 10, 15, 17, 19, 21],
  unit: 'berries',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Gets ? Berries.',
  RP: [1400, 1991, 2747, 3791, 5234, 7232]
});

MAINSKILLS.push(BERRY_BURST);
METRONOME_SKILLS.push(BERRY_BURST);
