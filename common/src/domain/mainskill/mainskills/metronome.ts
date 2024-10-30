import { MAX_SKILL_LEVEL } from '../../constants';
import { MAINSKILLS, Mainskill, createBaseSkill } from '../mainskill';

export const METRONOME: Mainskill = createBaseSkill({
  name: 'Metronome',
  amount: [1, 2, 3, 4, 5, 6], // max level rolls max level amount of chosen skill
  unit: 'metronome',
  maxLevel: MAX_SKILL_LEVEL - 1,
  description: 'Uses one randomly chosen main skill.',
  RP: [880, 1251, 1726, 2383, 3290, 4546],
});
MAINSKILLS.push(METRONOME);
// TODO: I think metronome can trigger Moonlight, but needs confirmation. Also how about Stockpile and Disguise?
export const METRONOME_SKILLS = MAINSKILLS.filter((s) => s !== METRONOME && !s.isModified);
export const METRONOME_FACTOR = METRONOME_SKILLS.length;
